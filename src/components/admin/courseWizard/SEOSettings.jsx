import React from "react";
import { Search } from "lucide-react";

const SEOSettings = ({ data, setData }) => {

  const updateField = (field, value) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-xl font-semibold">
          SEO Settings
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Optimize your course for search engines.
        </p>
      </div>


      <div className="bg-[#111827] border border-[#243047] rounded-2xl p-6 space-y-5">


        <div className="flex items-center gap-3">

          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Search size={20}/>
          </div>

          <h3 className="font-semibold">
            Search Preview
          </h3>

        </div>



        <div>

          <label className="text-sm text-slate-400">
            SEO Title
          </label>


          <input
            value={data.seoTitle || ""}
            onChange={(e) =>
              updateField(
                "seoTitle",
                e.target.value
              )
            }
            placeholder="SEO optimized title"
            className="w-full mt-2 bg-[#0B1220] border border-[#243047] rounded-xl px-4 py-3 text-white"
          />

        </div>



        <div>

          <label className="text-sm text-slate-400">
            Meta Description
          </label>


          <textarea
            value={data.metaDescription || ""}
            onChange={(e) =>
              updateField(
                "metaDescription",
                e.target.value
              )
            }
            rows="4"
            placeholder="Describe your course for search engines"
            className="w-full mt-2 bg-[#0B1220] border border-[#243047] rounded-xl px-4 py-3 text-white"
          />

        </div>



        <div>

          <label className="text-sm text-slate-400">
            Keywords
          </label>


          <input
            value={data.keywords || ""}
            onChange={(e) =>
              updateField(
                "keywords",
                e.target.value
              )
            }
            placeholder="chemistry, science, biology"
            className="w-full mt-2 bg-[#0B1220] border border-[#243047] rounded-xl px-4 py-3 text-white"
          />

        </div>


        <div className="bg-[#0B1220] rounded-xl p-4 border border-[#243047]">

          <p className="text-xs text-slate-500">
            Preview
          </p>

          <h4 className="mt-2 text-blue-400 font-semibold">
            {data.seoTitle || "Your course title"}
          </h4>

          <p className="text-sm text-slate-400 mt-1">
            {data.metaDescription ||
              "Your course description will appear here"}
          </p>

        </div>


      </div>

    </div>
  );
};

export default SEOSettings;