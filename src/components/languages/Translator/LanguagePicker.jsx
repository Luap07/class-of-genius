import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Search,
  Check,
  Languages,
} from "lucide-react";

const defaultLanguages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "yo", name: "Yoruba", flag: "🇳🇬" },
  { code: "ig", name: "Igbo", flag: "🇳🇬" },
  { code: "ha", name: "Hausa", flag: "🇳🇬" },
];

const LanguagePicker = ({
  value,
  languages = defaultLanguages,
  label = "Language",
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredLanguages = useMemo(() => {
    return languages.filter(
      (language) =>
        language.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        language.code
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [languages, search]);

  const selectedLanguage =
    languages.find((item) => item.code === value) ||
    languages[0];

  return (
    <div className="relative">

      <label className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 transition hover:border-cyan-500"
      >
        <div className="flex items-center gap-3">

          <Languages
            size={18}
            className="text-cyan-400"
          />

          <span className="text-lg">
            {selectedLanguage.flag}
          </span>

          <span className="font-semibold text-white">
            {selectedLanguage.name}
          </span>

        </div>

        <ChevronDown
          size={18}
          className={`transition ${
            open ? "rotate-180" : ""
          }`}
        />

      </button>

      <AnimatePresence>

        {open && (

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 10,
            }}
            className="absolute z-50 mt-3 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
          >
            <div className="border-b border-white/10 p-4">

              <div className="relative">

                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  value={search}
                  placeholder="Search language..."
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-white outline-none focus:border-cyan-500"
                />

              </div>

            </div>

            <div className="max-h-80 overflow-y-auto">

              {filteredLanguages.map((language) => {

                const active =
                  language.code === value;

                return (
                  <button
                    key={language.code}
                    onClick={() => {
                      onChange?.(language);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center justify-between px-5 py-4 transition ${
                      active
                        ? "bg-cyan-600/20"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-4">

                      <span className="text-2xl">
                        {language.flag}
                      </span>

                      <div className="text-left">

                        <p className="font-semibold text-white">
                          {language.name}
                        </p>

                        <p className="text-sm text-slate-400">
                          {language.code.toUpperCase()}
                        </p>

                      </div>

                    </div>

                    {active && (
                      <Check
                        size={18}
                        className="text-cyan-400"
                      />
                    )}

                  </button>
                );
              })}

              {filteredLanguages.length === 0 && (

                <div className="p-8 text-center text-slate-400">
                  No language found.
                </div>

              )}

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>
  );
};

export default LanguagePicker;