import React, { useState } from "react";
import { Upload, Save } from "lucide-react";

import AdminButton from "../../../components/admin/ui/AdminButton";

const Branding = () => {
  const [branding, setBranding] = useState({
    logo: "",
    primaryColor: "#2563eb",
    tagline: "Building Future Genius"
  });

  const handleChange = (e) => {
    setBranding({
      ...branding,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Branding Settings:", branding);

    // connect upload/API here
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Branding
        </h1>

        <p className="text-slate-400 mt-1">
          Customize your platform identity and appearance.
        </p>
      </div>


      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
      >

        <div>

          <label className="block text-sm text-slate-400 mb-2">
            Platform Logo
          </label>


          <button
            type="button"
            className="flex items-center gap-2 px-4 py-3 bg-slate-800 rounded-xl text-blue-400"
          >
            <Upload size={18}/>
            Upload Logo
          </button>

        </div>


        <div>

          <label className="block text-sm text-slate-400 mb-2">
            Primary Color
          </label>


          <input
            type="text"
            name="primaryColor"
            value={branding.primaryColor}
            onChange={handleChange}
            className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none"
          />

        </div>


        <div>

          <label className="block text-sm text-slate-400 mb-2">
            Tagline
          </label>


          <input
            name="tagline"
            value={branding.tagline}
            onChange={handleChange}
            className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none"
          />

        </div>


        <AdminButton type="submit">

          <span className="flex items-center gap-2">
            <Save size={18}/>
            Save Branding
          </span>

        </AdminButton>


      </form>

    </div>
  );
};

export default Branding;