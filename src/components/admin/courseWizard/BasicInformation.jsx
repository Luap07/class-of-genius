import React from "react";

const BasicInformation = ({ data, setData }) => {
  const updateField = (field, value) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-5">

      <div>
        <label className="text-sm text-slate-400">
          Course Title
        </label>

        <input
          value={data.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Enter course title"
          className="w-full mt-2 rounded-xl bg-[#111827] border border-[#243047] px-4 py-3 text-white outline-none focus:border-blue-500"
        />
      </div>


      <div>
        <label className="text-sm text-slate-400">
          Short Description
        </label>

        <textarea
          value={data.shortDescription || ""}
          onChange={(e) =>
            updateField(
              "shortDescription",
              e.target.value
            )
          }
          placeholder="Course summary"
          rows="4"
          className="w-full mt-2 rounded-xl bg-[#111827] border border-[#243047] px-4 py-3 text-white outline-none focus:border-blue-500"
        />
      </div>


      <div className="grid md:grid-cols-2 gap-5">

        <div>
          <label className="text-sm text-slate-400">
            Category
          </label>

          <select
            value={data.category || ""}
            onChange={(e) =>
              updateField(
                "category",
                e.target.value
              )
            }
            className="w-full mt-2 rounded-xl bg-[#111827] border border-[#243047] px-4 py-3 text-white"
          >
            <option value="">
              Select category
            </option>
            <option value="science">
              Science
            </option>
            <option value="technology">
              Technology
            </option>
            <option value="business">
              Business
            </option>
          </select>
        </div>


        <div>
          <label className="text-sm text-slate-400">
            Level
          </label>

          <select
            value={data.level || ""}
            onChange={(e) =>
              updateField(
                "level",
                e.target.value
              )
            }
            className="w-full mt-2 rounded-xl bg-[#111827] border border-[#243047] px-4 py-3 text-white"
          >
            <option value="">
              Select level
            </option>
            <option value="beginner">
              Beginner
            </option>
            <option value="intermediate">
              Intermediate
            </option>
            <option value="advanced">
              Advanced
            </option>
          </select>

        </div>

      </div>


      <div>
        <label className="text-sm text-slate-400">
          Course Description
        </label>

        <textarea
          value={data.description || ""}
          onChange={(e) =>
            updateField(
              "description",
              e.target.value
            )
          }
          rows="6"
          placeholder="Full course description"
          className="w-full mt-2 rounded-xl bg-[#111827] border border-[#243047] px-4 py-3 text-white outline-none focus:border-blue-500"
        />

      </div>

    </div>
  );
};

export default BasicInformation;