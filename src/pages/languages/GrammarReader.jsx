import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import LessonHeader from "../../components/languages/grammar/LessonHeader";
import LessonSection from "../../components/languages/grammar/LessonSection";
import LessonExample from "../../components/languages/grammar/LessonExample";
import LessonPractice from "../../components/languages/grammar/LessonPractice";
import LessonSummary from "../../components/languages/grammar/LessonSummary";

export default function GrammarReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLesson();
  }, [id]);

  async function fetchLesson() {
    try {
      setLoading(true);
      const { data: lessonData, error: lessonError } = await supabase
        .from("language_grammar")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (lessonError) {
        console.error("Lesson Fetch Error:", lessonError);
        return;
      }

      if (!lessonData) {
        console.log("Grammar lesson not found");
        return;
      }

      const { data: allLessons } = await supabase
        .from("language_grammar")
        .select("*")
        .order("sort_order", { ascending: true });

      setLesson(lessonData);
      setLessons(allLessons || []);
    } catch (error) {
      console.error("Reader Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const currentIndex = useMemo(() => {
    if (!lesson) return -1;
    return lessons.findIndex((item) => item.id === lesson.id);
  }, [lessons, lesson]);

  const previousLesson =
    currentIndex > 0
      ? lessons[currentIndex - 1]
      : lesson?.previous_lesson
      ? lessons.find((item) => item.id === lesson.previous_lesson)
      : null;

  const nextLesson =
    currentIndex >= 0 && currentIndex < lessons.length - 1
      ? lessons[currentIndex + 1]
      : lesson?.next_lesson
      ? lessons.find((item) => item.id === lesson.next_lesson)
      : null;

  if (loading) {
    return (
      <section className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="text-xl text-slate-400">Loading grammar lesson...</div>
      </section>
    );
  }

  if (!lesson) {
    return (
      <section className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-black text-white">Lesson Not Found</h2>
          <button
            onClick={() => navigate("/grammar")}
            className="mt-8 rounded-xl bg-cyan-600 px-8 py-3 font-bold text-white transition hover:bg-cyan-500"
          >
            Back to Grammar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#020617] via-[#071426] to-[#030712] text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <LessonHeader lesson={lesson} />
        <div className="mt-12 space-y-10 rounded-[40px] border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
          {lesson.introduction && (
            <LessonSection title="Introduction" content={lesson.introduction} />
          )}
          {lesson.explanation && (
            <LessonSection title="Explanation" content={lesson.explanation} />
          )}
          {lesson.rules && (
            <LessonSection title="Grammar Rules" content={lesson.rules} />
          )}
          {lesson.examples && <LessonExample examples={lesson.examples} />}
          {lesson.practice && <LessonPractice practice={lesson.practice} />}
          {lesson.summary && <LessonSummary summary={lesson.summary} />}
        </div>
       </div>
    </section>
  );
}