import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  RefreshCw,
  Loader2,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

import AnalyticsStats from "../../components/admin/languages/analytics/AnalyticsStats";
import LanguagesChart from "../../components/admin/languages/analytics/LanguagesChart";
import LearningTrendChart from "../../components/admin/languages/analytics/LearningTrendChart";
import PopularLanguages from "../../components/admin/languages/analytics/PopularLanguages";
import RecentActivity from "../../components/admin/languages/analytics/RecentActivity";
import CompletionTable from "../../components/admin/languages/analytics/CompletionTable";
import LoadingAnalytics from "../../components/admin/languages/analytics/LoadingAnalytics";

export default function LanguageAnalytics() {
  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [stats, setStats] =
    useState({});

  const [chartData, setChartData] =
    useState([]);

  const [trendData, setTrendData] =
    useState([]);

  const [popularLanguages, setPopularLanguages] =
    useState([]);

  const [recentActivity, setRecentActivity] =
    useState([]);

  const [completionData, setCompletionData] =
    useState([]);

  const fetchAnalytics =
    useCallback(async () => {
      try {
        setLoading(true);

        const [
          languages,
          lessons,
          vocabulary,
          dictionary,
          flashcards,
          phrasebook,
          challenges,
          games,
        ] = await Promise.all([
          supabase.from("languages").select("*"),
          supabase.from("language_lessons").select("*"),
          supabase.from("language_vocabulary").select("*"),
          supabase.from("language_dictionary").select("*"),
          supabase.from("language_flashcards").select("*"),
          supabase.from("language_phrasebook").select("*"),
          supabase.from("language_challenges").select("*"),
          supabase.from("language_games").select("*"),
        ]);

        setStats({
          languages:
            languages.data?.length || 0,

          lessons:
            lessons.data?.length || 0,

          vocabulary:
            vocabulary.data?.length || 0,

          dictionary:
            dictionary.data?.length || 0,

          flashcards:
            flashcards.data?.length || 0,

          phrasebook:
            phrasebook.data?.length || 0,

          challenges:
            challenges.data?.length || 0,

          games:
            games.data?.length || 0,
        });

        setChartData(
          languages.data || []
        );

        setTrendData(
          lessons.data || []
        );

        setPopularLanguages(
          languages.data
            ?.slice(0, 10) || []
        );

        setRecentActivity(
          lessons.data
            ?.slice(0, 10) || []
        );

        setCompletionData(
          languages.data || []
        );

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await fetchAnalytics();

      setRefreshing(false);
    };

  const overview = useMemo(
    () => [
      {
        title: "Languages",
        value: stats.languages || 0,
      },
      {
        title: "Lessons",
        value: stats.lessons || 0,
      },
      {
        title: "Vocabulary",
        value: stats.vocabulary || 0,
      },
      {
        title: "Dictionary",
        value: stats.dictionary || 0,
      },
      {
        title: "Flashcards",
        value: stats.flashcards || 0,
      },
      {
        title: "Phrasebooks",
        value: stats.phrasebook || 0,
      },
      {
        title: "Challenges",
        value: stats.challenges || 0,
      },
      {
        title: "Games",
        value: stats.games || 0,
      },
    ],
    [stats]
  );
    if (loading) {
    return <LoadingAnalytics />;
  }

  return (
    <section className="space-y-8">

      {/* ================= HEADER ================= */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          flex
          flex-col
          gap-6
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >

        <div>

          <h1
            className="
              text-4xl
              font-black
              text-white
            "
          >
            Language Analytics
          </h1>

          <p
            className="
              mt-2
              text-slate-400
            "
          >
            Monitor language content, learner engagement,
            and platform performance in one place.
          </p>

        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="
            flex
            items-center
            gap-2
            rounded-2xl
            bg-gradient-to-r
            from-cyan-500
            to-blue-600
            px-6
            py-3
            font-bold
            text-white
          "
        >

          {refreshing ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <RefreshCw size={18} />
          )}

          Refresh Analytics

        </button>

      </motion.div>

      {/* ================= OVERVIEW ================= */}

      <AnalyticsStats
        stats={overview}
      />

      {/* ================= CHARTS ================= */}

      <div
        className="
          grid
          gap-8
          xl:grid-cols-2
        "
      >

        <LanguagesChart
          data={chartData}
        />

        <LearningTrendChart
          data={trendData}
        />

      </div>

      {/* ================= POPULAR + ACTIVITY ================= */}

      <div
        className="
          grid
          gap-8
          xl:grid-cols-2
        "
      >

        <PopularLanguages
          languages={popularLanguages}
        />

        <RecentActivity
          activities={recentActivity}
        />

      </div>

      {/* ================= COMPLETION ================= */}

      <CompletionTable
        data={completionData}
      />

    </section>
  );
}