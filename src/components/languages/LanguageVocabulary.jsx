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
    className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 transition hover:border-blue-500"
  >

    {word.image_url && (
      <img
        src={word.image_url}
        alt={word.word}
        className="h-52 w-full object-cover"
      />
    )}

    <div className="p-6">

      <div className="flex items-start justify-between">

        <div>
          <h2 className="text-3xl font-black text-white">
            {word.word}
          </h2>

          {word.translation && (
            <p className="mt-2 text-xl font-bold text-blue-400">
              {word.translation}
            </p>
          )}
        </div>


        {word.audio_url && (
          <button
            onClick={() => new Audio(word.audio_url).play()}
            className="rounded-full bg-blue-600 p-3 hover:bg-blue-500"
          >
            <Volume2 size={18}/>
          </button>
        )}

      </div>


      <div className="mt-5 flex flex-wrap gap-2">

        {word.part_of_speech && (
          <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm text-cyan-300">
            {word.part_of_speech}
          </span>
        )}

        {word.difficulty && (
          <span className="rounded-full bg-purple-500/20 px-3 py-1 text-sm text-purple-300">
            {word.difficulty}
          </span>
        )}

        {word.featured && (
          <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm text-yellow-300">
            Featured
          </span>
        )}

      </div>


      {word.pronunciation && (
        <p className="mt-5 text-slate-300">
          Pronunciation: {word.pronunciation}
        </p>
      )}


      {word.ipa && (
        <p className="mt-2 text-slate-400">
          IPA: {word.ipa}
        </p>
      )}


      {word.definition && (
        <div className="mt-5 rounded-2xl bg-slate-800 p-4">

          <p className="mb-2 text-xs font-bold uppercase text-slate-500">
            Definition
          </p>

          <p className="text-slate-300">
            {word.definition}
          </p>

        </div>
      )}


      {word.example_sentence && (
        <div className="mt-5 rounded-2xl bg-slate-800 p-4">

          <p className="mb-2 text-xs font-bold uppercase text-slate-500">
            Example
          </p>

          <p className="text-blue-300">
            {word.example_sentence}
          </p>

        </div>
      )}


      {word.example_translation && (
        <div className="mt-4">

          <p className="text-xs font-bold uppercase text-slate-500">
            Translation
          </p>

          <p className="italic text-slate-400">
            {word.example_translation}
          </p>

        </div>
      )}

    </div>

  </div>
))}
    </div>
  );
}