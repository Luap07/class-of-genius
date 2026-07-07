// src/pages/lms/CourseViewer.jsx

import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
} from "lucide-react";

import { useCourses } from "../../../context/LMSContext/CourseContext";

import ViewerHeader from "../../../components/lms/courseViewer/ViewerHeader";
import LessonSidebar from "../../../components/lms/courseViewer/LessonSidebar";
import PDFViewer from "../../../components/lms/courseViewer/PDFViewer";
import ProgressPanel from "../../../components/lms/courseViewer/ProgressPanel";
import NotesPanel from "../../../components/lms/courseViewer/NotesPanel";
import NavigationButtons from "../../../components/lms/courseViewer/NavigationButtons";
import AITutorButton from "../../../components/lms/courseViewer/AITutorButton";

const CourseViewer = () => {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams();

  const {
    courses = [],
    markModuleCompleted,
  } = useCourses() || {};

  const course = useMemo(() => {
    // FIXED: Removed the invalid semicolon after null
    return courses.find((item) => String(item.id) === String(courseId)) || null;
  }, [courses, courseId]);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={70} className="mx-auto text-slate-600" />
          <h2 className="text-3xl font-bold mt-6">Course Not Found</h2>
          <button
            onClick={() => navigate("/lms/courses")}
            className="mt-6 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const modules = course.modules || [];

  const activeModule = modules.find((module) => String(module.id) === String(moduleId)) || modules[0];

  const activeIndex = modules.findIndex((module) => String(module.id) === String(activeModule?.id));

  const previousModule = activeIndex > 0 ? modules[activeIndex - 1] : null;
  const nextModule = activeIndex < modules.length - 1 ? modules[activeIndex + 1] : null;

  const completedModules = modules.filter((module) => module.completed).length;
  const progress = modules.length === 0 ? 0 : Math.round((completedModules / modules.length) * 100);

  const [notes, setNotes] = useState("");
  
  const handleComplete = () => {
    if (!activeModule) return;
    if (markModuleCompleted) {
      markModuleCompleted(course.id, activeModule.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <ViewerHeader course={course} progress={progress} />

      <div className="grid lg:grid-cols-[320px_1fr] gap-6 p-6">
        {/* LEFT SIDEBAR */}
        <LessonSidebar
          courseId={course.id}
          modules={modules}
          activeModuleId={activeModule?.id}
        />

        {/* MAIN CONTENT */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-800">
              <button
                onClick={() => navigate("/lms/courses")}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-5"
              >
                <ArrowLeft size={18} /> Back to Courses
              </button>
              <h1 className="text-3xl font-bold">{activeModule?.title}</h1>
              <p className="text-slate-400 mt-2">{activeModule?.description}</p>
            </div>

            <div className="p-6">
              <PDFViewer pdf={activeModule?.pdf} />
            </div>
          </motion.div>

          <div className="grid xl:grid-cols-2 gap-6">
            <ProgressPanel
              progress={progress}
              completedModules={completedModules}
              totalModules={modules.length}
              onComplete={handleComplete}
            />
            <NotesPanel notes={notes} setNotes={setNotes} />
          </div>

          <AITutorButton course={course} module={activeModule} />

          <NavigationButtons
            previousModule={previousModule}
            nextModule={nextModule}
            courseId={course.id}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;