import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Loader2,
  BookOpen,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

const cardAccents = [
  {
    border: "hover:border-indigo-500/50",
    gradient: "from-indigo-500/10 via-purple-500/5 to-transparent",
    badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]",
    ambientColor: "rgba(99,102,241,.4)",
  },
  {
    border: "hover:border-violet-500/50",
    gradient: "from-violet-500/10 via-fuchsia-500/5 to-transparent",
    badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]",
    ambientColor: "rgba(139,92,246,.4)",
  },
  {
    border: "hover:border-pink-500/50",
    gradient: "from-pink-500/10 via-rose-500/5 to-transparent",
    badge: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.3)]",
    ambientColor: "rgba(236,72,153,.4)",
  },
  {
    border: "hover:border-cyan-500/50",
    gradient: "from-cyan-500/10 via-blue-500/5 to-transparent",
    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]",
    ambientColor: "rgba(6,182,212,.4)",
  },
  {
    border: "hover:border-emerald-500/50",
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
    ambientColor: "rgba(16,185,129,.4)",
  },
  {
    border: "hover:border-amber-500/50",
    gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]",
    ambientColor: "rgba(245,158,11,.4)",
  },
];

export default function LanguageContentManager() {
  const navigate = useNavigate();

  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLanguages = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("languages")
        .select("*")
        .order("name", {
          ascending: true,
        });

      if (error) throw error;

      setLanguages(data || []);
    } catch (err) {
      console.error("Fetch languages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  return (
    <div className="min-h-screen bg-[#030712] p-6 text-white">

      <style>{`
        @keyframes borderGlow {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }

        .animate-orbit {
          animation: borderGlow 6s linear infinite;
        }
      `}</style>

      <div className="mb-10">

        <h1 className="text-5xl font-black">
          Language CMS
        </h1>

        <p className="mt-2 text-gray-400">
          Select a language to open its dedicated CMS.
        </p>

      </div>

      {loading ? (
        <div className="flex justify-center py-24">

          <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />

        </div>
      ) : languages.length === 0 ? (
        <div className="py-24 text-center text-gray-500">

          <p className="text-xl font-bold">
            No languages found.
          </p>

        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-4">
          {languages.map((language, index) => {
            const accent = cardAccents[index % cardAccents.length];

            return (
              <button
                key={language.id}
                onClick={() =>
                  navigate("/admin/languages/cms/overview", {
                    state: {
                      language,
                    },
                  })
                }
                className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-left transition-all duration-300 hover:bg-white/15 ${accent.border} ${accent.glow}`}
              >
                {/* Animated Ambient Ring */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 overflow-hidden opacity-30 transition-opacity duration-500 group-hover:opacity-90">
                  <div
                    className="absolute inset-0 animate-orbit rounded-full"
                    style={{
                      background: `conic-gradient(
                        from 0deg,
                        transparent 0%,
                        ${accent.ambientColor} 50%,
                        transparent 100%
                      )`,
                    }}
                  />
                </div>

                {/* Background Glow */}
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent.gradient} opacity-60 transition duration-300 group-hover:opacity-100`}
                />

                {/* Icon */}
                <div className="absolute right-0 top-0 p-6 opacity-25 transition-all duration-300 group-hover:scale-110 group-hover:opacity-75">
                  <BookOpen
                    size={64}
                    className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,.4)]"
                  />
                </div>

                {/* Card Content */}
                <div className="relative z-10">

                  <span
                    className={`mb-4 inline-block rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${accent.badge}`}
                  >
                    {language.code || "LANG"}
                  </span>

                  <h2 className="text-2xl font-black transition group-hover:text-white">
                    {language.name}
                  </h2>

                  <p className="mt-1 font-medium text-gray-400">
                    {language.native_name || "Custom Language"}
                  </p>

                  {language.description && (
                    <p className="mt-4 line-clamp-3 text-sm text-gray-500">
                      {language.description}
                    </p>
                  )}

                </div>

                <div className="relative z-10 mt-8 flex items-center justify-between border-t border-white/5 pt-4">

                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Open CMS
                  </span>

                  <div className="flex items-center gap-2 text-sm font-bold text-indigo-400 transition-transform group-hover:translate-x-1">
                    <span>Manage</span>
                    <span>→</span>
                  </div>

                </div>

              </button>
            );
          })}
        </div>
      )}
          </div>
  );
}
