// src/components/languages/LanguageCMSAdmin.jsx

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  ArrowLeft,
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
  const navigate = useNavigate();

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
      <div className="mx-auto max-w-4xl px-6 py-24">
        <div className="rounded-[32px] border border-slate-800 bg-slate-900/90 p-12 text-center shadow-2xl backdrop-blur-xl">
          <Languages className="mx-auto mb-6 h-16 w-16 text-slate-500" />
          <h2 className="text-3xl font-black text-white">Select a Language</h2>
          <p className="mt-3 text-slate-400">
            Choose a language from the content manager dashboard to manage its workspace.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3.5 font-bold text-white shadow-lg transition hover:scale-105"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-slate-900/90 to-blue-600/10 p-8 shadow-2xl backdrop-blur-xl md:p-10"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-cyan-500/30 bg-cyan-500/10 shadow-lg">
              <Languages className="h-10 w-10 text-cyan-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
                CMS Workspace
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                {language.name} Workspace
              </h1>
              <p className="mt-2 text-slate-400">
                Manage curriculum, vocabulary, lessons, and interactive learning materials.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-5 py-3.5 font-bold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
      </motion.div>

      {/* Workspace Navigation */}
      <div className="flex flex-wrap gap-3 rounded-[28px] border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 rounded-2xl px-5 py-3 font-bold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  : "border border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700 hover:text-white"
              }`}
            >
              <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
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
        transition={{ duration: 0.3 }}
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