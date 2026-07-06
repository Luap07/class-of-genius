// src/pages/curriculum/TopicPage.jsx

import React from "react";
import { useParams } from "react-router-dom";

import curricula from "../../data/Curriculum/curricula";

import TopicHero from "../../components/TopicPage/TopicHero";
import StudyResources from "../../components/TopicPage/StudyResources";
import Assessment from "../../components/TopicPage/Assessment";
import RelatedTopics from "../../components/TopicPage/RelatedTopics";

const TopicPage = () => {
  const { country, level, grade, subject, topic } = useParams();

  /* =========================
     NORMALIZE HELPER
  ========================= */
  const slugify = (str = "") =>
    str.toLowerCase().replace(/\s+/g, "-");

  /* =========================
     COUNTRY
  ========================= */
  const countryData = curricula.find(
    (c) => slugify(c.country) === country
  );

  if (!countryData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Country not found.
      </div>
    );
  }

  /* =========================
     LEVEL (SAFE FOR ARRAY OBJECTS)
  ========================= */
  const levelData =
    countryData.levels?.find((l) => l.id === level) ||
    countryData.levels?.find((l) => slugify(l.name) === level);

  if (!levelData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Level not found.
      </div>
    );
  }

  /* =========================
     SUBJECTS (FLEXIBLE STRUCTURE)
  ========================= */
  const rawSubjects =
    levelData.subjects ||
    levelData.years ||
    [];

  const subjectName = subject?.replace(/-/g, " ");

  const subjectExists =
    rawSubjects.some((s) =>
      typeof s === "string"
        ? slugify(s) === subject
        : slugify(s.name || s) === subject
    );

  const subjectData = {
    name: subjectName,
    topics: subjectExists
      ? [
          "Overview",
          "Key Concepts",
          "Examples",
          "Practice Questions",
          "Quiz"
        ]
      : rawSubjects.map((s) =>
          typeof s === "string" ? s : s.name
        )
  };

  /* =========================
     TOPIC (SAFE AUTO FALLBACK)
  ========================= */
  const topicName = topic?.replace(/-/g, " ");

  const topicData = {
    name: topicName || "Topic",
    description:
      "This is a learning module generated from curriculum structure."
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 mb-8">

          <span>{countryData.country}</span>
          <span>/</span>
          <span>{levelData.name || levelData.level}</span>
          <span>/</span>
          <span>{subjectData.name}</span>
          <span>/</span>
          <span className="text-cyan-400">
            {topicData.name}
          </span>

        </div>

        {/* HERO */}
        <TopicHero
          country={countryData}
          level={levelData}
          grade={grade}
          subject={subjectData}
          topic={topicData}
        />

        {/* STUDY RESOURCES */}
        <StudyResources
          country={countryData}
          grade={grade}
          subject={subjectData}
          topic={topicData}
        />

        {/* ASSESSMENT */}
        <Assessment
          country={countryData}
          grade={grade}
          subject={subjectData}
          topic={topicData}
        />

        {/* RELATED TOPICS */}
        <RelatedTopics
          subject={subjectData}
          currentTopic={topicData}
        />

        {/* FOOTER */}
        <footer className="mt-20 border-t border-slate-800 py-8 text-center">
          <p className="text-slate-500">
            Powered by{" "}
            <span className="text-cyan-400 font-semibold">
              Scholiqen
            </span>
          </p>
        </footer>

      </div>

    </div>
  );
};

export default TopicPage;