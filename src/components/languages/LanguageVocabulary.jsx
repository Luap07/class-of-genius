import React, { useEffect, useState } from "react";
import { BookOpen, Volume2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function LanguageVocabulary({
  language,
}) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!language) return;

    const fetchVocabulary = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("language_vocabulary")
          .select("*")
          .eq("language_id", language.id)
          .order("created_at", {
            ascending: false,
          });

        if (error) throw error;

        setWords(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVocabulary();
  }, [language]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        Loading vocabulary...
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-12 text-center">
        <BookOpen className="mx-auto h-14 w-14 text-blue-400" />

        <h2 className="mt-6 text-3xl font-black">
          No Vocabulary Yet
        </h2>

        <p className="mt-4 text-slate-400">
          Upload vocabulary from the Language CMS.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

      {words.map((word) => (

        <div
          key={word.id}
          className="rounded-3xl border border-white/10 bg-slate-900 p-6 transition hover:border-blue-500"
        >

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-black text-white">
              {word.word}
            </h2>

            {word.audio_url && (
              <button
                onClick={() => new Audio(word.audio_url).play()}
                className="rounded-full bg-blue-600 p-3 hover:bg-blue-500"
              >
                <Volume2 size={18} />
              </button>
            )}

          </div>

          {word.translation && (
            <p className="mt-4 text-lg font-semibold text-blue-400">
              {word.translation}
            </p>
          )}

          {word.pronunciation && (
            <p className="mt-2 text-slate-300">
              Pronunciation: {word.pronunciation}
            </p>
          )}

          {word.example && (
            <div className="mt-5 rounded-2xl bg-slate-800 p-4">
              <p className="text-slate-400">
                {word.example}
              </p>
            </div>
          )}

          {word.category && (
            <span className="mt-5 inline-block rounded-full bg-blue-600/20 px-4 py-2 text-sm text-blue-400">
              {word.category}
            </span>
          )}

        </div>

      ))}

    </div>
  );
}