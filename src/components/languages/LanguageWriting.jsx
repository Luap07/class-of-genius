// src/components/languages/LanguageWriting.jsx

import React, { useEffect, useState } from "react";
import {
  PenTool,
  CheckCircle,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  Send,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function LanguageWriting({ language }) {
  const [writing, setWriting] = useState([]);
  const [loading, setLoading] = useState(true);

  // State to track text input, feedback, and loading per exercise
  const [userTexts, setUserTexts] = useState({});
  const [aiFeedbacks, setAiFeedbacks] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [checkingAiId, setCheckingAiId] = useState(null);

  useEffect(() => {
    if (!language) return;

    const fetchWriting = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("language_writing")
          .select("*")
          .eq("language_id", language.id)
          .order("created_at", {
            ascending: false,
          });

        if (error) throw error;

        setWriting(data || []);
      } catch (err) {
        console.error("Error fetching writing exercises:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWriting();
  }, [language]);

  const handleTextChange = (exerciseId, value) => {
    setUserTexts((prev) => ({
      ...prev,
      [exerciseId]: value,
    }));
  };

  const handleSubmitWriting = async (exerciseId) => {
    const text = userTexts[exerciseId];
    if (!text || !text.trim()) {
      alert("Please write your answer before submitting.");
      return;
    }

    try {
      setSubmittingId(exerciseId);
      // Simulate submission or save to Supabase user progress table if available
      await new Promise((resolve) => setTimeout(resolve, 800));
      alert("Writing exercise submitted successfully!");
    } catch (err) {
      console.error("Error submitting writing:", err);
      alert("Failed to submit writing exercise.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCheckWithAI = async (exerciseId, promptText) => {
    const text = userTexts[exerciseId];
    if (!text || !text.trim()) {
      alert("Please enter some text to check with AI.");
      return;
    }

    try {
      setCheckingAiId(exerciseId);
      
      // Simulated AI Grammar & Style Evaluation
      // In production, connect this to your AI Tutor edge function / API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const sampleFeedback = {
        score: "8.5 / 10",
        grammar: "Good sentence structures used. Watch out for minor agreement errors.",
        vocabulary: "Nice use of target language phrasing.",
        suggestion: "Consider trying to connect your clauses with more complex conjunctions.",
      };

      setAiFeedbacks((prev) => ({
        ...prev,
        [exerciseId]: sampleFeedback,
      }));
    } catch (err) {
      console.error("Error checking with AI:", err);
      alert("Failed to get AI feedback.");
    } finally {
      setCheckingAiId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <Loader2 size={36} className="animate-spin text-cyan-400" />
        <p className="mt-4 text-sm font-medium text-slate-400">
          Loading writing exercises...
        </p>
      </div>
    );
  }

  if (writing.length === 0) {
    return (
      <div className="rounded-[32px] border border-slate-800 bg-slate-900/90 p-12 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-yellow-500/20 bg-yellow-500/10">
          <PenTool className="h-10 w-10 text-yellow-400" />
        </div>
        <h2 className="mt-6 text-3xl font-black text-white">
          No Writing Exercises Yet
        </h2>
        <p className="mt-3 text-slate-400">
          Upload writing lessons from the Language CMS workspace to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {writing.map((exercise) => {
        const currentText = userTexts[exercise.id] || "";
        const feedback = aiFeedbacks[exercise.id];
        const isSubmitting = submittingId === exercise.id;
        const isCheckingAi = checkingAiId === exercise.id;

        return (
          <div
            key={exercise.id}
            className="rounded-[32px] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl md:p-10"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3.5 py-1 text-xs font-semibold text-yellow-300">
                  Writing Practice
                </div>
                <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                  {exercise.title}
                </h2>

                {exercise.description && (
                  <p className="mt-3 text-slate-400 leading-relaxed">
                    {exercise.description}
                  </p>
                )}
              </div>

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
                <FileText size={28} className="text-yellow-400" />
              </div>
            </div>

            {exercise.prompt && (
              <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-800/60 p-6 backdrop-blur-sm">
                <h3 className="flex items-center gap-2 font-bold text-yellow-400">
                  <Sparkles size={18} />
                  Writing Prompt
                </h3>
                <p className="mt-3 text-slate-300 leading-relaxed">
                  {exercise.prompt}
                </p>
              </div>
            )}

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Your Response
              </label>
              <textarea
                rows={7}
                value={currentText}
                onChange={(e) => handleTextChange(exercise.id, e.target.value)}
                placeholder="Write your answer here in the target language..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-800/80 p-5 text-white outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            {/* AI Feedback Section */}
            {feedback && (
              <div className="mt-6 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-2 font-bold text-violet-300">
                    <Sparkles size={18} className="text-violet-400" />
                    AI Evaluation & Feedback
                  </h4>
                  <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-200">
                    Score: {feedback.score}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
                  <div className="rounded-xl bg-slate-900/60 p-4 border border-violet-500/20">
                    <span className="font-semibold text-violet-400 block mb-1">Grammar</span>
                    {feedback.grammar}
                  </div>
                  <div className="rounded-xl bg-slate-900/60 p-4 border border-violet-500/20">
                    <span className="font-semibold text-violet-400 block mb-1">Vocabulary</span>
                    {feedback.vocabulary}
                  </div>
                  <div className="rounded-xl bg-slate-900/60 p-4 border border-violet-500/20">
                    <span className="font-semibold text-violet-400 block mb-1">Suggestion</span>
                    {feedback.suggestion}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => handleSubmitWriting(exercise.id)}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-2xl bg-yellow-500 px-7 py-3.5 font-bold text-slate-950 transition hover:bg-yellow-400 disabled:opacity-50 shadow-lg shadow-yellow-500/20"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CheckCircle size={18} />
                )}
                Submit Writing
              </button>

              <button
                onClick={() => handleCheckWithAI(exercise.id, exercise.prompt)}
                disabled={isCheckingAi}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-3.5 font-bold text-white transition hover:scale-[1.02] disabled:opacity-50 shadow-lg shadow-violet-600/20"
              >
                {isCheckingAi ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Sparkles size={18} />
                )}
                Check with AI
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}