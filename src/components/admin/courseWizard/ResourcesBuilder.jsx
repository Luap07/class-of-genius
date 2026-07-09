import React from "react";
import { Plus, Trash2, FileText } from "lucide-react";

const ResourcesBuilder = ({ data, setData }) => {

  const addResource = () => {
    setData((prev) => ({
      ...prev,
      resources: [
        ...(prev.resources || []),
        {
          id: Date.now(),
          title: "New Resource",
          type: "PDF",
          url: "",
        },
      ],
    }));
  };


  const updateResource = (
    id,
    field,
    value
  ) => {
    setData((prev) => ({
      ...prev,
      resources: prev.resources.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));
  };


  const removeResource = (id) => {
    setData((prev) => ({
      ...prev,
      resources: prev.resources.filter(
        (item) => item.id !== id
      ),
    }));
  };


  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-semibold">
            Resources Builder
          </h2>

          <p className="text-sm text-slate-400">
            Add downloadable files and extra materials.
          </p>
        </div>


        <button
          onClick={addResource}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={18}/>
          Add Resource
        </button>

      </div>


      <div className="space-y-4">

        {(data.resources || []).map((resource) => (

          <div
            key={resource.id}
            className="bg-[#111827] border border-[#243047] rounded-2xl p-5"
          >

            <div className="flex items-center gap-3">

              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <FileText size={20}/>
              </div>


              <input
                value={resource.title}
                onChange={(e) =>
                  updateResource(
                    resource.id,
                    "title",
                    e.target.value
                  )
                }
                className="flex-1 bg-[#0B1220] border border-[#243047] rounded-xl px-4 py-2 text-white"
                placeholder="Resource name"
              />


              <button
                onClick={() =>
                  removeResource(resource.id)
                }
                className="p-2 rounded-lg text-red-400 hover:bg-red-500/20"
              >
                <Trash2 size={18}/>
              </button>

            </div>


            <div className="grid md:grid-cols-2 gap-4 mt-4">

              <select
                value={resource.type}
                onChange={(e) =>
                  updateResource(
                    resource.id,
                    "type",
                    e.target.value
                  )
                }
                className="bg-[#0B1220] border border-[#243047] rounded-xl px-4 py-2 text-white"
              >

                <option value="PDF">
                  PDF
                </option>

                <option value="Video">
                  Video
                </option>

                <option value="Link">
                  External Link
                </option>

              </select>


              <input
                value={resource.url}
                onChange={(e) =>
                  updateResource(
                    resource.id,
                    "url",
                    e.target.value
                  )
                }
                placeholder="Resource URL"
                className="bg-[#0B1220] border border-[#243047] rounded-xl px-4 py-2 text-white"
              />

            </div>

          </div>

        ))}


        {(!data.resources ||
          data.resources.length === 0) && (

          <div className="border border-dashed border-[#243047] rounded-2xl p-8 text-center text-slate-400">
            No resources added yet.
          </div>

        )}

      </div>

    </div>
  );
};

export default ResourcesBuilder;