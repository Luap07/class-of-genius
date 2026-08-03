import React, { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function LanguageAlphabet({
  language,
}) {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
   const playAudio = (url) => {
    if (!url) return;

    const audio = new Audio(url);

    audio.play().catch((err) => {
      console.error("Audio playback failed:", err);
    });
  };
  useEffect(() => {
    if (!language) return;

    const fetchAlphabet = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("language_alphabet")
          .select("*")
          .eq("language_id", language.id)
          .order("sort_order", {
  ascending: true,
});

        if (error) throw error;

        setLetters(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlphabet();
  }, [language]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        Loading alphabet...
      </div>
    );
  }

  if (letters.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-12 text-center">
        <h2 className="text-3xl font-black">
          No Alphabet Yet
        </h2>

        <p className="mt-4 text-slate-400">
          Upload alphabet letters from the Language CMS.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">

      {letters.map((letter) => (

        <div
          key={letter.id}
          className="rounded-3xl border border-white/10 bg-slate-900 p-6 transition hover:border-blue-500"
        >

          {letter.image_url && (
  <img
    src={letter.image_url}
    alt={letter.example_word}
    className="mb-5 h-40 w-full rounded-2xl object-cover"
  />
)}

<h2 className="text-center text-6xl font-black text-blue-400">
  {letter.letter}
</h2>

{letter.pronunciation && (
  <p className="mt-4 text-center text-slate-300">
    {letter.pronunciation}
  </p>
)}

{letter.ipa && (
  <p className="mt-2 text-center font-mono text-sm text-cyan-400">
    {letter.ipa}
  </p>
)}

          <div className="mt-4 text-center space-y-1">
  {letter.example_word && (
    <p className="font-semibold text-white">
      {letter.example_word}
    </p>
  )}

  {letter.example_translation && (
    <p className="text-sm text-slate-400">
      {letter.example_translation}
    </p>
  )}
</div>

          {letter.audio_url && (
            <button
             onClick={() => playAudio(letter.audio_url)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 font-bold transition hover:bg-blue-500"
            >
              <Volume2 size={18} />
              Listen
            </button>
          )}

        </div>

      ))}

    </div>
  );
}