import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  BookOpen,
  Languages,
  GraduationCap,
  Brain,
  Sparkles,
  Plus,
  RefreshCw,
  Loader2,
  Clock,
  FileText,
  Headphones,
  Mic2,
  Pencil,
  Globe,
  Library,
  ChevronRight,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

export default function LanguageWorkspace({
  language,
  refresh,
}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [overview, setOverview] = useState({
    lessons: 0,
    vocabulary: 0,
    grammar: 0,
    listening: 0,
    speaking: 0,
    writing: 0,
  });

  const [recentLessons, setRecentLessons] = useState([]);
  const [recentVocabulary, setRecentVocabulary] = useState([]);

  const loadWorkspace = useCallback(async () => {
    if (!language) return;

    setLoading(true);

    try {
      const [
        lessonsResult,
        vocabularyResult,
        grammarResult,
      ] = await Promise.all([
        supabase
          .from("language_lessons")
          .select("*")
          .eq("language_id", language.id),

        supabase
          .from("language_vocabulary")
          .select("*")
          .eq("language_id", language.id),

        supabase
          .from("language_grammar")
          .select("*")
          .eq("language_id", language.id),
      ]);

      const lessons = lessonsResult.data || [];
      const vocabulary = vocabularyResult.data || [];
      const grammar = grammarResult.data || [];

      setOverview({
        lessons: lessons.length,
        vocabulary: vocabulary.length,
        grammar: grammar.length,
        listening: lessons.filter(
          (item) => item.type === "listening"
        ).length,
        speaking: lessons.filter(
          (item) => item.type === "speaking"
        ).length,
        writing: lessons.filter(
          (item) => item.type === "writing"
        ).length,
      });

      setRecentLessons(
        [...lessons]
          .sort(
            (a, b) =>
              new Date(b.created_at) -
              new Date(a.created_at)
          )
          .slice(0, 5)
      );

      setRecentVocabulary(
        [...vocabulary]
          .sort(
            (a, b) =>
              new Date(b.created_at) -
              new Date(a.created_at)
          )
          .slice(0, 6)
      );
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }, [language]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadWorkspace();

    if (refresh) {
      await refresh();
    }

    setRefreshing(false);
  };

  const statCards = useMemo(
    () => [
      {
        title: "Lessons",
        value: overview.lessons,
        icon: BookOpen,
        color:
          "from-cyan-500/20 to-blue-500/20",
      },
      {
        title: "Vocabulary",
        value: overview.vocabulary,
        icon: Library,
        color:
          "from-violet-500/20 to-fuchsia-500/20",
      },
      {
        title: "Grammar",
        value: overview.grammar,
        icon: GraduationCap,
        color:
          "from-emerald-500/20 to-green-500/20",
      },
      {
        title: "Listening",
        value: overview.listening,
        icon: Headphones,
        color:
          "from-pink-500/20 to-rose-500/20",
      },
      {
        title: "Speaking",
        value: overview.speaking,
        icon: Mic2,
        color:
          "from-orange-500/20 to-red-500/20",
      },
      {
        title: "Writing",
        value: overview.writing,
        icon: Pencil,
        color:
          "from-indigo-500/20 to-purple-500/20",
      },
    ],
    [overview]
  );

  if (loading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">

        <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />

      </div>
    );
  }

  return (
    <div className="space-y-8">

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-indigo-500/10 p-8"
      >

        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="mb-4 flex items-center gap-3">

              <Sparkles className="h-6 w-6 text-cyan-400" />

              <span className="rounded-full bg-cyan-500/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">

                Workspace

              </span>

            </div>

            <h2 className="text-4xl font-black">

              {language?.name} Workspace

            </h2>

            <p className="mt-3 max-w-3xl text-slate-400">

              Manage every learning experience for this language from one dashboard.

            </p>

          </div>

          <div className="flex flex-wrap gap-4">

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3 font-bold transition hover:bg-cyan-400"
            >
              {refreshing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5" />
              )}

              Refresh
            </button>

            <button
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-bold transition hover:bg-indigo-500"
            >
              <Plus className="h-5 w-5" />

              New Lesson
            </button>

          </div>

        </div>

      </motion.div>
            {/* Statistics */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {statCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.05,
              }}
              className={`rounded-3xl border border-white/10 bg-gradient-to-br ${card.color} p-6`}
            >
              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-400">
                    {card.title}
                  </p>

                  <h3 className="mt-2 text-4xl font-black">
                    {card.value}
                  </h3>

                </div>

                <div className="rounded-2xl bg-black/20 p-4">

                  <Icon className="h-8 w-8 text-white" />

                </div>

              </div>

            </motion.div>
          );
        })}

      </div>

      {/* Quick Actions */}

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">

        <div className="mb-8 flex items-center justify-between">

          <div>

            <h3 className="text-2xl font-black">

              Quick Actions

            </h3>

            <p className="mt-2 text-slate-400">

              Jump straight into creating new learning content.

            </p>

          </div>

        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          <button
            className="group rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-6 text-left transition hover:border-cyan-400 hover:bg-cyan-500/10"
          >
            <BookOpen className="mb-5 h-10 w-10 text-cyan-400" />

            <h4 className="text-xl font-black">

              New Lesson

            </h4>

            <p className="mt-2 text-sm text-slate-400">

              Create a new lesson with videos,
              quizzes and exercises.

            </p>

          </button>

          <button
            className="group rounded-3xl border border-violet-500/20 bg-violet-500/5 p-6 text-left transition hover:border-violet-400 hover:bg-violet-500/10"
          >
            <Library className="mb-5 h-10 w-10 text-violet-400" />

            <h4 className="text-xl font-black">

              Vocabulary

            </h4>

            <p className="mt-2 text-sm text-slate-400">

              Add new words, meanings,
              pronunciations and examples.

            </p>

          </button>

          <button
            className="group rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-left transition hover:border-emerald-400 hover:bg-emerald-500/10"
          >
            <GraduationCap className="mb-5 h-10 w-10 text-emerald-400" />

            <h4 className="text-xl font-black">

              Grammar

            </h4>

            <p className="mt-2 text-sm text-slate-400">

              Build grammar rules,
              examples and exercises.

            </p>

          </button>

          <button
            className="group rounded-3xl border border-pink-500/20 bg-pink-500/5 p-6 text-left transition hover:border-pink-400 hover:bg-pink-500/10"
          >
            <Brain className="mb-5 h-10 w-10 text-pink-400" />

            <h4 className="text-xl font-black">

              AI Tutor

            </h4>

            <p className="mt-2 text-sm text-slate-400">

              Configure AI conversations
              and language practice.

            </p>

          </button>

        </div>

      </div>
            <div className="grid gap-8 xl:grid-cols-[1.4fr_.9fr]">

        {/* Recent Lessons */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">

          <div className="mb-8 flex items-center justify-between">

            <div>

              <h3 className="text-2xl font-black">

                Recent Lessons

              </h3>

              <p className="mt-2 text-slate-400">

                The newest lessons created for this language.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 transition hover:border-cyan-500 hover:bg-cyan-500/10">

              View All

              <ChevronRight className="h-4 w-4" />

            </button>

          </div>

          {recentLessons.length === 0 ? (

            <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-white/10">

              <div className="text-center">

                <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-500" />

                <h4 className="text-xl font-bold">

                  No lessons yet

                </h4>

                <p className="mt-2 text-slate-500">

                  Create your first lesson to get started.

                </p>

              </div>

            </div>

          ) : (

            <div className="space-y-4">

              {recentLessons.map((lesson) => (

                <div
                  key={lesson.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-cyan-500/40"
                >

                  <div className="flex items-start justify-between gap-5">

                    <div>

                      <h4 className="text-lg font-black">

                        {lesson.title}

                      </h4>

                      <p className="mt-2 text-sm text-slate-400">

                        {lesson.description ||
                          "No description available."}

                      </p>

                    </div>

                    <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300">

                      {lesson.level || "General"}

                    </span>

                  </div>

                  <div className="mt-5 flex items-center gap-6 text-sm text-slate-500">

                    <div className="flex items-center gap-2">

                      <Clock className="h-4 w-4" />

                      {lesson.duration || 0} mins

                    </div>

                    <div className="flex items-center gap-2">

                      <FileText className="h-4 w-4" />

                      {lesson.type || "Lesson"}

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* Recent Vocabulary */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">

          <div className="mb-8">

            <h3 className="text-2xl font-black">

              Latest Vocabulary

            </h3>

            <p className="mt-2 text-slate-400">

              Recently added vocabulary words.

            </p>

          </div>

          {recentVocabulary.length === 0 ? (

            <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-white/10">

              <div className="text-center">

                <Languages className="mx-auto mb-4 h-12 w-12 text-slate-500" />

                <h4 className="text-xl font-bold">

                  No vocabulary

                </h4>

                <p className="mt-2 text-slate-500">

                  Start building your dictionary.

                </p>

              </div>

            </div>

          ) : (

            <div className="space-y-4">

              {recentVocabulary.map((word) => (

                <div
                  key={word.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-violet-500/40"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h4 className="text-xl font-black">

                        {word.word}

                      </h4>

                      <p className="mt-2 text-sm text-slate-400">

                        {word.translation ||
                          word.meaning ||
                          "No translation"}

                      </p>

                    </div>

                    <Globe className="h-7 w-7 text-violet-400" />

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>
            <div className="grid gap-8 lg:grid-cols-2">

        {/* Content Distribution */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">

          <div className="mb-8">

            <h3 className="text-2xl font-black">

              Content Distribution

            </h3>

            <p className="mt-2 text-slate-400">

              Overview of all learning resources available.

            </p>

          </div>

          <div className="space-y-5">

            {[
              {
                label: "Lessons",
                value: overview.lessons,
                color: "bg-cyan-500",
                total: Math.max(overview.lessons, 1),
              },
              {
                label: "Vocabulary",
                value: overview.vocabulary,
                color: "bg-violet-500",
                total: Math.max(overview.lessons, 1),
              },
              {
                label: "Grammar",
                value: overview.grammar,
                color: "bg-emerald-500",
                total: Math.max(overview.lessons, 1),
              },
            ].map((item) => {

              const percent =
                overview.lessons === 0
                  ? 0
                  : (item.value / overview.lessons) * 100;

              return (

                <div key={item.label}>

                  <div className="mb-2 flex items-center justify-between">

                    <span className="font-semibold">

                      {item.label}

                    </span>

                    <span className="text-sm text-slate-400">

                      {item.value}

                    </span>

                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-white/10">

                    <div
                      className={`h-full ${item.color} transition-all duration-700`}
                      style={{
                        width: `${Math.min(percent, 100)}%`,
                      }}
                    />

                  </div>

                </div>

              );

            })}

          </div>

        </div>

        {/* Workspace Shortcuts */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">

          <div className="mb-8">

            <h3 className="text-2xl font-black">

              Workspace Shortcuts

            </h3>

            <p className="mt-2 text-slate-400">

              Quickly jump into the most common tasks.

            </p>

          </div>

          <div className="space-y-4">

            {[
              {
                icon: BookOpen,
                title: "Manage Lessons",
                subtitle: "Create and organize lessons",
              },
              {
                icon: Library,
                title: "Vocabulary Bank",
                subtitle: "Words, meanings and pronunciation",
              },
              {
                icon: GraduationCap,
                title: "Grammar Rules",
                subtitle: "Grammar topics and examples",
              },
              {
                icon: Headphones,
                title: "Listening Practice",
                subtitle: "Audio exercises",
              },
              {
                icon: Mic2,
                title: "Speaking Practice",
                subtitle: "Conversation activities",
              },
              {
                icon: Brain,
                title: "AI Tutor",
                subtitle: "AI-powered conversations",
              },
            ].map((item) => {

              const Icon = item.icon;

              return (

                <button
                  key={item.title}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-5 text-left transition hover:border-cyan-500/40 hover:bg-cyan-500/5"
                >

                  <div className="flex items-center gap-4">

                    <div className="rounded-xl bg-cyan-500/10 p-3">

                      <Icon className="h-6 w-6 text-cyan-400" />

                    </div>

                    <div>

                      <h4 className="font-bold">

                        {item.title}

                      </h4>

                      <p className="text-sm text-slate-400">

                        {item.subtitle}

                      </p>

                    </div>

                  </div>

                  <ChevronRight className="h-5 w-5 text-slate-500" />

                </button>

              );

            })}

          </div>

        </div>

      </div>
            {/* Footer */}

      <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-indigo-500/10 p-8">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h3 className="text-2xl font-black">

              {language?.name} Workspace Ready

            </h3>

            <p className="mt-2 max-w-3xl text-slate-400">

              Use the navigation tabs above to manage lessons, grammar,
              vocabulary, alphabet, culture, listening, speaking, writing,
              and AI tutoring for this language.

            </p>

          </div>

          <div className="flex flex-wrap gap-4">

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3 font-bold transition hover:bg-cyan-400"
            >
              {refreshing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5" />
              )}

              Refresh Workspace
            </button>

            <button
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-bold transition hover:bg-indigo-500"
            >
              <Plus className="h-5 w-5" />

              Create Content
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}