import React, {
  useEffect,
  useState,
  useCallback
} from "react";

import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  Sparkles
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

const sections = [
  "Overview",
  "Grammar",
  "Vocabulary",
  "Lessons",
  "Culture"
];

// Beautiful vibrant accent colors & gradients for cards
const cardAccents = [
  {
    border: "hover:border-indigo-500/50",
    gradient: "from-indigo-500/10 via-purple-500/5 to-transparent",
    badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]",
    ambientColor: "rgba(99, 102, 241, 0.4)",
  },
  {
    border: "hover:border-violet-500/50",
    gradient: "from-violet-500/10 via-fuchsia-500/5 to-transparent",
    badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]",
    ambientColor: "rgba(139, 92, 246, 0.4)",
  },
  {
    border: "hover:border-pink-500/50",
    gradient: "from-pink-500/10 via-rose-500/5 to-transparent",
    badge: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.3)]",
    ambientColor: "rgba(236, 72, 153, 0.4)",
  },
  {
    border: "hover:border-cyan-500/50",
    gradient: "from-cyan-500/10 via-blue-500/5 to-transparent",
    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]",
    ambientColor: "rgba(6, 182, 212, 0.4)",
  },
  {
    border: "hover:border-emerald-500/50",
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
    ambientColor: "rgba(16, 185, 129, 0.4)",
  },
  {
    border: "hover:border-amber-500/50",
    gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]",
    ambientColor: "rgba(245, 158, 11, 0.4)",
  }
];

export default function LanguageContentManager() {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedSection, setSelectedSection] = useState("Overview");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [fetchingSection, setFetchingSection] = useState(false);

  const fetchLanguages = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("languages")
        .select("*")
        .order("name");

      if (error) throw error;
      setLanguages(data || []);
    } catch (error) {
      console.error("Fetch languages:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  const fetchSectionContent = useCallback(async (langId, sectionType) => {
    try {
      setFetchingSection(true);
      const { data, error } = await supabase
        .from("language_sections")
        .select("title, content")
        .eq("language_id", langId)
        .eq("section_type", sectionType)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setTitle(data.title || "");
        setContent(data.content || "");
      } else {
        setTitle("");
        setContent("");
      }
    } catch (error) {
      console.error("Fetch section content:", error);
    } finally {
      setFetchingSection(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      fetchSectionContent(selectedLanguage.id, selectedSection);
    }
  }, [selectedLanguage, selectedSection, fetchSectionContent]);

  const saveSection = async () => {
    if (!selectedLanguage) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from("language_sections")
        .upsert({
          language_id: selectedLanguage.id,
          section_type: selectedSection,
          title,
          content,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "language_id,section_type"
        });

      if (error) throw error;
      alert("Section saved successfully!");
    } catch (error) {
      console.error("Save section:", error);
      alert("Failed to save section. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (selectedLanguage) {
    return (
      <div className="min-h-screen bg-[#030712] p-6 text-white">
        <button
          onClick={() => {
            setSelectedLanguage(null);
            setTitle("");
            setContent("");
            setSelectedSection("Overview");
          }}
          className="flex items-center gap-2 mb-8 rounded-2xl bg-white/10 px-5 py-2.5 font-bold text-gray-300 transition hover:bg-white/20 hover:text-white cursor-pointer w-fit"
        >
          <ArrowLeft size={18} />
          Back to Languages
        </button>

        <div className="mb-8 flex flex-col gap-2">
          <span className="text-indigo-400 font-semibold uppercase tracking-wider text-sm flex items-center gap-2">
            <Sparkles size={16} /> Content Manager
          </span>
          <h1 className="text-4xl font-black">
            {selectedLanguage.name} Content
          </h1>
        </div>

        {/* Section Tabs Grid */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={`rounded-2xl px-5 py-4 font-bold transition cursor-pointer flex items-center justify-center gap-2 border ${
                selectedSection === section
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30"
                  : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10"
              }`}
            >
              <BookOpen size={18} />
              {section}
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <div className="max-w-4xl rounded-3xl bg-white/5 border border-white/10 p-8 space-y-6 backdrop-blur-xl relative">
          {fetchingSection && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10">
              <Loader2 className="animate-spin text-indigo-500 h-8 w-8" />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300">Section Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Enter title for ${selectedSection}...`}
              className="w-full rounded-2xl bg-white/10 border border-white/10 p-4 text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300">Section Content (Markdown / Text)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Write content for ${selectedSection}...`}
              rows={12}
              className="w-full rounded-2xl bg-white/10 border border-white/10 p-4 text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition resize-y"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={saveSection}
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 font-bold hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save size={20} />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] p-6 text-white">
      <style>{`
        @keyframes borderGlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-orbit {
          animation: borderGlow 6s linear infinite;
        }
      `}</style>

      <div className="mb-10">
        <h1 className="text-5xl font-black">Language CMS</h1>
        <p className="mt-2 text-gray-400">Select a language to manage its curriculum and course sections.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-indigo-500 h-12 w-12" />
        </div>
      ) : languages.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <p className="text-xl font-bold">No languages found.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 xl:grid-cols-4 gap-6">
          {languages.map((language, index) => {
            const accent = cardAccents[index % cardAccents.length];
            return (
              <button
                key={language.id}
                onClick={() => setSelectedLanguage(language)}
                className={`group relative rounded-3xl bg-white/5 border border-white/10 p-8 text-left hover:bg-white/15 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden ${accent.border} ${accent.glow}`}
              >
                {/* Rotating Ambient Light Border Effect behind the BookOpen icon */}
                <div className="absolute -top-12 -right-12 w-36 h-36 opacity-30 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 animate-orbit rounded-full" style={{ background: `conic-gradient(from 0deg, transparent 0%, ${accent.ambientColor} 50%, transparent 100%)` }} />
                </div>

                {/* Dynamic background gradient glow per card */}
                <div className={`absolute inset-0 bg-gradient-to-br ${accent.gradient} opacity-60 group-hover:opacity-100 transition duration-300 pointer-events-none`} />

                <div className="absolute top-0 right-0 p-6 opacity-25 group-hover:opacity-75 group-hover:scale-110 transition-all duration-300">
                  <BookOpen size={64} className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
                </div>

                <div className="relative z-10">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-4 uppercase tracking-wider ${accent.badge}`}>
                    {language.code || "Lang"}
                  </span>
                  <h2 className="text-2xl font-black group-hover:text-white transition">
                    {language.name}
                  </h2>
                  <p className="text-gray-400 mt-1 font-medium">
                    {language.native_name || "Custom Language"}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between relative z-10 pt-4 border-t border-white/5">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Curriculum CMS</span>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                    <span>Manage</span>
                    <span>→</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}