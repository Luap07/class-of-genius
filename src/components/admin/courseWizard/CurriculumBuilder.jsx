import React from "react";
import { Plus, Trash2 } from "lucide-react";

const CurriculumBuilder = ({ data, setData }) => {

  const addSection = () => {
    setData((prev) => ({
      ...prev,
      curriculum: [
        ...(prev.curriculum || []),
        {
          id: Date.now(),
          title: "New Section",
          lessons: [],
        },
      ],
    }));
  };


  const updateSection = (id, value) => {
    setData((prev) => ({
      ...prev,
      curriculum: prev.curriculum.map((section) =>
        section.id === id
          ? {
              ...section,
              title: value,
            }
          : section
      ),
    }));
  };


  const removeSection = (id) => {
    setData((prev) => ({
      ...prev,
      curriculum: prev.curriculum.filter(
        (section) => section.id !== id
      ),
    }));
  };


  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-semibold">
            Curriculum Builder
          </h2>

          <p className="text-sm text-slate-400">
            Create course modules and sections
          </p>
        </div>


        <button
          onClick={addSection}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
        >
          <Plus size={18}/>
          Add Section
        </button>

      </div>


      <div className="space-y-4">

        {(data.curriculum || []).map((section) => (

          <div
            key={section.id}
            className="bg-[#111827] border border-[#243047] rounded-2xl p-5"
          >

            <div className="flex items-center gap-3">

              <input
                value={section.title}
                onChange={(e) =>
                  updateSection(
                    section.id,
                    e.target.value
                  )
                }
                className="flex-1 bg-transparent border border-[#243047] rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
              />


              <button
                onClick={() =>
                  removeSection(section.id)
                }
                className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
              >
                <Trash2 size={18}/>
              </button>

            </div>


            <div className="mt-4 rounded-xl bg-[#0B1220] p-4">

              <p className="text-sm text-slate-400">
                Lessons will be added in the Lessons Builder step.
              </p>

            </div>


          </div>

        ))}


        {(!data.curriculum ||
          data.curriculum.length === 0) && (

          <div className="rounded-2xl border border-dashed border-[#243047] p-8 text-center">

            <p className="text-slate-400">
              No curriculum sections yet.
            </p>

          </div>

        )}

      </div>

    </div>
  );
};

export default CurriculumBuilder;