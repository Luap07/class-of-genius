import React, { useState } from "react";
import {
  KeyRound,
  Save,
  Eye,
  EyeOff
} from "lucide-react";

import AdminButton from "../../../components/admin/ui/AdminButton";

const APIKeys = () => {
  const [showKeys, setShowKeys] = useState({});

  const [keys, setKeys] = useState({
    openai: "",
    gemini: "",
    payment: "",
    storage: ""
  });

  const handleChange = (e) => {
    setKeys({
      ...keys,
      [e.target.name]: e.target.value
    });
  };

  const toggleVisibility = (key) => {
    setShowKeys({
      ...showKeys,
      [key]: !showKeys[key]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("API Keys:", keys);

    // connect secure backend storage here
  };

  const fields = [
    {
      name: "openai",
      label: "OpenAI API Key"
    },
    {
      name: "gemini",
      label: "Gemini API Key"
    },
    {
      name: "payment",
      label: "Payment Gateway Key"
    },
    {
      name: "storage",
      label: "Storage API Key"
    }
  ];

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          API Keys
        </h1>

        <p className="text-slate-400 mt-1">
          Manage external service API credentials.
        </p>
      </div>


      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
      >

        <div className="flex items-center gap-3">

          <KeyRound className="text-blue-400"/>

          <h2 className="text-xl font-semibold">
            Service Keys
          </h2>

        </div>


        {fields.map((field) => (
          <div key={field.name}>

            <label className="block text-sm text-slate-400 mb-2">
              {field.label}
            </label>


            <div className="relative">

              <input
                type={
                  showKeys[field.name]
                    ? "text"
                    : "password"
                }
                name={field.name}
                value={keys[field.name]}
                onChange={handleChange}
                placeholder="Enter API key"
                className="w-full bg-slate-800 rounded-xl px-4 py-3 pr-12 outline-none"
              />


              <button
                type="button"
                onClick={() =>
                  toggleVisibility(field.name)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >

                {showKeys[field.name] ? (
                  <EyeOff size={18}/>
                ) : (
                  <Eye size={18}/>
                )}

              </button>

            </div>

          </div>
        ))}


        <AdminButton type="submit">

          <span className="flex items-center gap-2">
            <Save size={18}/>
            Save API Keys
          </span>

        </AdminButton>


      </form>

    </div>
  );
};

export default APIKeys;