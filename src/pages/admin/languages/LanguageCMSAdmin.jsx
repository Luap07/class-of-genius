import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Languages,
  BookOpen,
  SpellCheck,
  PenTool,
  Headphones,
  Mic,
  Globe2,
  Sparkles,
  CaseUpper,
} from "lucide-react";
import { motion } from "framer-motion";

// Workspace modules
import LanguageOverview from "./LanguageOverview";
import LanguageAlphabet from "./LanguageAlphabet";
import LanguageVocabulary from "./LanguageVocabulary";
import LanguageGrammar from "./LanguageGrammar";
import LanguageLessons from "./LanguageLessons";
import LanguageWriting from "./LanguageWriting";
import LanguageListening from "./LanguageListening";
import LanguageSpeaking from "./LanguageSpeaking";
import LanguageCulture from "./LanguageCulture";
import LanguageAITutor from "./LanguageAITutor";

export default function LanguageCMSAdmin() {

  const location = useLocation();

  const language = location.state?.language;

  const [activeTab, setActiveTab] = useState("overview");
  const tabs = [
    { id: "overview", name: "Overview", icon: LayoutDashboard },
    { id: "alphabet", name: "Alphabet", icon: CaseUpper },
    { id: "vocabulary", name: "Vocabulary", icon: BookOpen },
    { id: "grammar", name: "Grammar", icon: SpellCheck },
    { id: "lessons", name: "Lessons", icon: Languages },
    { id: "writing", name: "Writing", icon: PenTool },
    { id: "listening", name: "Listening", icon: Headphones },
    { id: "speaking", name: "Speaking", icon: Mic },
    { id: "culture", name: "Culture", icon: Globe2 },
    { id: "ai", name: "AI Tutor", icon: Sparkles },
  ];

  if (!language) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <Languages className="mx-auto mb-5 h-14 w-14 text-slate-500" />
        <h2 className="text-2xl font-black text-white">Select a Language</h2>
        <p className="mt-3 text-slate-400">
          Choose a language from the content manager.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 p-8"
      >
        <div className="flex items-center gap-5">
          <div className="rounded-3xl bg-indigo-500/20 p-5">
            <Languages className="h-10 w-10 text-indigo-300" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">
              {language.name} Workspace
            </h1>
            <p className="mt-2 text-slate-400">
              Manage all learning materials for this language.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Workspace Navigation */}
      <div className="flex flex-wrap gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 rounded-2xl px-5 py-3 font-bold transition ${
                activeTab === tab.id
                  ? "bg-indigo-500 text-black"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Icon size={19} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Workspace Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {activeTab === "overview" && <LanguageOverview language={language} />}
        {activeTab === "alphabet" && <LanguageAlphabet language={language} />}
        {activeTab === "vocabulary" && <LanguageVocabulary language={language} />}
        {activeTab === "grammar" && <LanguageGrammar language={language} />}
        {activeTab === "lessons" && <LanguageLessons language={language} />}
        {activeTab === "writing" && <LanguageWriting language={language} />}
        {activeTab === "listening" && <LanguageListening language={language} />}
        {activeTab === "speaking" && <LanguageSpeaking language={language} />}
        {activeTab === "culture" && <LanguageCulture language={language} />}
        {activeTab === "ai" && <LanguageAITutor language={language} />}
      </motion.div>
    </div>
  );
}