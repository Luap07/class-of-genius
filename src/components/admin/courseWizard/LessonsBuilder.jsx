import React from "react";
import { Plus, Trash2 } from "lucide-react";

const LessonsBuilder = ({ data, setData }) => {

  const addLesson = (sectionId) => {
    setData((prev) => ({
      ...prev,
      curriculum: prev.curriculum.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lessons: [
                ...section.lessons,
                {
                  id: Date.now(),
                  title: "New Lesson",
                  video: "",
                  content: "",
                },
              ],
            }
          : section
      ),
    }));
  };


  const updateLesson = (
    sectionId,
    lessonId,
    field,
    value
  ) => {
    setData((prev) => ({
      ...prev,
      curriculum: prev.curriculum.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lessons: section.lessons.map((lesson) =>
                lesson.id === lessonId
                  ? {
                      ...lesson,
                      [field]: value,
                    }
                  : lesson
              ),
            }
          : section
      ),
    }));
  };


  const removeLesson = (
    sectionId,
    lessonId
  ) => {
    setData((prev) => ({
      ...prev,
      curriculum: prev.curriculum.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lessons: section.lessons.filter(
                (lesson) =>
                  lesson.id !== lessonId
              ),
            }
          : section
      ),
    }));
  };


  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-xl font-semibold">
          Lessons Builder
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Add videos and learning materials to each module.
        </p>
      </div>


      {(data.curriculum || []).map((section) => (

        <div
          key={section.id}
          className="bg-[#111827] border border-[#243047] rounded-2xl p-5"
        >

          <div className="flex items-center justify-between mb-4">

            <h3 className="font-semibold">
              {section.title}
            </h3>


            <button
              onClick={() =>
                addLesson(section.id)
              }
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={16}/>
              Add Lesson
            </button>

          </div>


          <div className="space-y-4">

            {section.lessons.map((lesson) => (

              <div
                key={lesson.id}
                className="rounded-xl bg-[#0B1220] border border-[#243047] p-4"
              >

                <div className="flex gap-3">

                  <input
                    value={lesson.title}
                    onChange={(e) =>
                      updateLesson(
                        section.id,
                        lesson.id,
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="Lesson title"
                    className="flex-1 rounded-xl bg-[#111827] border border-[#243047] px-4 py-2 text-white"
                  />


                  <button
                    onClick={() =>
                      removeLesson(
                        section.id,
                        lesson.id
                      )
                    }
                    className="text-red-400 p-2 hover:bg-red-500/20 rounded-lg"
                  >
                    <Trash2 size={18}/>
                  </button>

                </div>


                <input
                  value={lesson.video}
                  onChange={(e) =>
                    updateLesson(
                      section.id,
                      lesson.id,
                      "video",
                      e.target.value
                    )
                  }
                  placeholder="Video URL"
                  className="w-full mt-3 rounded-xl bg-[#111827] border border-[#243047] px-4 py-2 text-white"
                />


                <textarea
                  value={lesson.content}
                  onChange={(e) =>
                    updateLesson(
                      section.id,
                      lesson.id,
                      "content",
                      e.target.value
                    )
                  }
                  placeholder="Lesson notes"
                  rows="3"
                  className="w-full mt-3 rounded-xl bg-[#111827] border border-[#243047] px-4 py-3 text-white"
                />

              </div>

            ))}


            {section.lessons.length === 0 && (
              <p className="text-sm text-slate-500">
                No lessons added yet.
              </p>
            )}

          </div>

        </div>

      ))}


      {(!data.curriculum ||
        data.curriculum.length === 0) && (

        <div className="border border-dashed border-[#243047] rounded-2xl p-8 text-center text-slate-400">
          Create curriculum sections first.
        </div>

      )}

    </div>
  );
};

export default LessonsBuilder;