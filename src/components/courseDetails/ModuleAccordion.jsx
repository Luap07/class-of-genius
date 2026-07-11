// src/components/courseDetails/ModuleAccordion.jsx

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  PlayCircle,
  FileText,
  HelpCircle,
  BookOpen,
  Lock,
  Unlock,
  Bookmark,
  CheckCircle2,
  Loader2,
  Clock3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const ModuleAccordion = ({ course }) => {
  const navigate = useNavigate();

  /* ======================================================
     STATE
  ====================================================== */
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModule, setOpenModule] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [lastLesson, setLastLesson] = useState(null);
  const [courseProgress, setCourseProgress] = useState(0);
  const [certificateUnlocked, setCertificateUnlocked] = useState(false);
  const [studyTime, setStudyTime] = useState(0);

  /* ======================================================
     LOAD DATA
  ====================================================== */
  useEffect(() => {
    if (!course?.id) return;
    loadCurriculum();
    loadProgress();
  }, [course]);

  const loadProgress = async () => {
    try {
      const { data } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("course_id", course.id);

      if (data) {
        setCompletedLessons(data.map((item) => item.lesson_id));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const loadCurriculum = async () => {
    try {
      setLoading(true);
      setError("");

      const { data: topics, error } = await supabase
        .from("topics")
        .select("*")
        .eq("course_id", course.id)
        .order("position", { ascending: true });

      if (error) throw error;

      const curriculum = [];

      for (const topic of topics || []) {
        const { data: resources } = await supabase
          .from("resources")
          .select("*")
          .eq("topic_id", topic.id)
          .order("position", { ascending: true });

        const { data: tasks } = await supabase
          .from("weekly_tasks")
          .select("*")
          .eq("topic_id", topic.id);

        const { data: quizzes } = await supabase
          .from("monthly_quizzes")
          .select("*")
          .eq("topic_id", topic.id);

        const lessons = [];

        // Videos
        (resources || [])
          .filter((item) => item.type === "video")
          .forEach((video) => {
            lessons.push({
              id: video.id,
              title: video.title,
              type: "video",
              duration: video.duration || "0 min",
              locked: video.locked || false,
              url: video.url,
            });
          });

        // Documents
        (resources || [])
          .filter((item) => item.type !== "video")
          .forEach((resource) => {
            lessons.push({
              id: resource.id,
              title: resource.title,
              type: "resource",
              duration: resource.duration || "-",
              locked: resource.locked || false,
              file: resource.file_url,
            });
          });

        // Weekly Tasks
        (tasks || []).forEach((task) => {
          lessons.push({
            id: task.id,
            title: task.title,
            type: "weekly_task",
            duration: task.deadline || "",
            locked: false,
          });
        });

        // Monthly Quizzes
        (quizzes || []).forEach((quiz) => {
          lessons.push({
            id: quiz.id,
            title: quiz.title,
            type: "quiz",
            duration: `${quiz.questions || 0} Questions`,
            locked: false,
          });
        });

        curriculum.push({
          id: topic.id,
          title: topic.title,
          description: topic.description,
          duration: topic.duration || "0 min",
          lessons,
        });
      }

      setModules(curriculum);
      if (curriculum.length > 0) setOpenModule(curriculum[0].id);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     EFFECTS
  ====================================================== */
  useEffect(() => {
    let total = 0;
    let completed = 0;
    modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        total++;
        if (completedLessons.includes(lesson.id)) completed++;
      });
    });

    setCourseProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
  }, [modules, completedLessons]);

  useEffect(() => {
    if (courseProgress === 100) setCertificateUnlocked(true);
  }, [courseProgress]);

  useEffect(() => {
    const timer = setInterval(() => {
      setStudyTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /* ======================================================
     HANDLERS
  ====================================================== */
  const bookmarkLesson = (lesson) => {
    if (bookmarks.includes(lesson.id)) {
      setBookmarks((prev) => prev.filter((id) => id !== lesson.id));
      return;
    }
    setBookmarks((prev) => [...prev, lesson.id]);
  };

  const completeLesson = async (lesson) => {
    if (completedLessons.includes(lesson.id)) return;
    try {
      await supabase.from("lesson_progress").insert({
        course_id: course.id,
        lesson_id: lesson.id,
        completed: true,
      });
      setCompletedLessons((prev) => [...prev, lesson.id]);
    } catch (err) {
      console.log(err);
    }
  };

  const lessonIcon = (type) => {
    switch (type) {
      case "video": return <PlayCircle size={18} />;
      case "resource": return <FileText size={18} />;
      case "weekly_task": return <BookOpen size={18} />;
      case "quiz": return <HelpCircle size={18} />;
      default: return <PlayCircle size={18} />;
    }
  };

  const openLesson = async (lesson) => {
    if (lesson.locked) return;
    setLastLesson(lesson);
    await completeLesson(lesson);
    switch (lesson.type) {
      case "video": navigate(`/lms/video/${lesson.id}`); break;
      case "resource": navigate(`/lms/resources/${lesson.id}`); break;
      case "weekly_task": navigate(`/lms/tasks/${lesson.id}`); break;
      case "quiz": navigate(`/lms/monthly-quiz/${lesson.id}`); break;
      default: break;
    }
  };

  const toggleModule = (id) => {
    setOpenModule((prev) => (prev === id ? null : id));
  };

  /* ======================================================
     RENDER STATES
  ====================================================== */
  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8">
        <h2 className="text-xl font-bold text-red-400">Failed to load curriculum</h2>
        <p className="mt-3 text-slate-300">{error}</p>
      </div>
    );
  }

  /* ======================================================
     MAIN RENDER
  ====================================================== */
  return (
    <div className="space-y-8">
      {/* Course Progress */}
      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Course Progress</h2>
            <p className="mt-2 text-slate-400">{courseProgress}% Completed</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Study Time</p>
            <p className="text-xl font-bold text-blue-400">{Math.floor(studyTime / 60)} mins</p>
          </div>
        </div>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${courseProgress}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
          />
        </div>
      </div>

      {/* Resume Learning */}
      {lastLesson && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-blue-500/30 bg-slate-900 p-6"
        >
          <h2 className="text-xl font-bold text-white">Continue Learning</h2>
          <p className="mt-3 text-slate-400">{lastLesson.title}</p>
          <button
            onClick={() => openLesson(lastLesson)}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
          >
            Resume Lesson
          </button>
        </motion.div>
      )}

      {/* Certificate */}
      {certificateUnlocked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-500 p-8 text-white"
        >
          <h2 className="text-3xl font-bold">🎉 Congratulations!</h2>
          <p className="mt-4 text-lg">You've completed this course.</p>
          <button className="mt-6 rounded-xl bg-white px-6 py-3 font-bold text-black transition hover:scale-105">
            Download Certificate
          </button>
        </motion.div>
      )}

      {/* Modules */}
      <div className="space-y-5">
        {modules.map((module) => (
          <motion.div
            key={module.id}
            layout
            className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900"
          >
            <button
              onClick={() => toggleModule(module.id)}
              className="flex w-full items-center justify-between p-6"
            >
              <div>
                <h2 className="text-left text-xl font-bold text-white">{module.title}</h2>
                <p className="mt-2 text-left text-slate-400">{module.description}</p>
              </div>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock3 size={16} />
                  {module.duration}
                </div>
                {openModule === module.id ? <ChevronDown /> : <ChevronRight />}
              </div>
            </button>

            <AnimatePresence>
              {openModule === module.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-800"
                >
                  <div className="space-y-3 p-6">
                    {module.lessons.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-700 py-10 text-center">
                        <p className="text-slate-500">No lessons have been added to this topic yet.</p>
                      </div>
                    ) : (
                      module.lessons.map((lesson) => {
                        const completed = completedLessons.includes(lesson.id);
                        const bookmarked = bookmarks.includes(lesson.id);
                        return (
                          <motion.button
                            key={lesson.id}
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openLesson(lesson)}
                            disabled={lesson.locked}
                            className="flex w-full items-center justify-between rounded-2xl border border-slate-700 bg-slate-950 p-5 text-left transition hover:border-blue-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-blue-400">{lessonIcon(lesson.type)}</div>
                              <div>
                                <h3 className="font-semibold text-white">{lesson.title}</h3>
                                <p className="mt-1 text-sm capitalize text-slate-400">
                                  {lesson.type.replace("_", " ")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-5">
                              <span className="text-sm text-slate-500">{lesson.duration}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  bookmarkLesson(lesson);
                                }}
                                className="text-yellow-400"
                              >
                                <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
                              </button>
                              {completed ? (
                                <CheckCircle2 size={20} className="text-green-400" />
                              ) : lesson.locked ? (
                                <Lock size={20} className="text-red-400" />
                              ) : (
                                <Unlock size={20} className="text-blue-400" />
                              )}
                            </div>
                          </motion.button>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ModuleAccordion;