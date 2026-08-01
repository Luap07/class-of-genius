import React from "react";

import { Languages } from "lucide-react";

export default function LanguageSelector({
  languages = [],
  value = "",
  onChange,
}) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-white/10
        bg-[#0f172a]
        p-6
      "
    >
      <div className="mb-5 flex items-center gap-3">
        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            bg-indigo-500/20
            text-indigo-400
          "
        >
          <Languages size={24} />
        </div>

        <div>
          <h2 className="text-xl font-black text-white">
            Select Language
          </h2>

          <p className="text-sm text-slate-400">
            Choose the language you want to manage.
          </p>
        </div>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          rounded-2xl
          border
          border-white/10
          bg-[#020617]
          px-5
          py-4
          text-white
          outline-none
          transition
          focus:border-indigo-500
        "
      >
        {languages.length === 0 ? (
          <option value="">
            No languages found
          </option>
        ) : (
          <>
            <option value="">
              Select Language...
            </option>

            {languages.map((language) => (
              <option
                key={language.id}
                value={language.id}
              >
                {language.flag_emoji
                  ? `${language.flag_emoji} `
                  : ""}
                {language.name}
                {language.native_name
                  ? ` (${language.native_name})`
                  : ""}
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
}