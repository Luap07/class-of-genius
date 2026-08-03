import React, { useEffect, useState } from "react";
import {
  Mic,
  Sparkles,
  Volume2,
  MessageCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function LanguageSpeaking({
  language,
}) {
  const [speaking, setSpeaking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!language) return;

    const fetchSpeaking = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("language_speaking")
          .select("*")
          .eq("language_id", language.id)
          .order("created_at", {
            ascending: false,
          });

        if (error) throw error;

        setSpeaking(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpeaking();
  }, [language]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        Loading speaking exercises...
      </div>
    );
  }

  if (speaking.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-12 text-center">
        <Mic className="mx-auto h-16 w-16 text-green-400" />

        <h2 className="mt-6 text-3xl font-black">
          No Speaking Exercises Yet
        </h2>

        <p className="mt-4 text-slate-400">
          Upload speaking activities from the Language CMS.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">

      {speaking.map((lesson) => (

        <div
          key={lesson.id}
          className="rounded-3xl border border-white/10 bg-slate-900 p-8 transition hover:border-green-500"
        >

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-black">
                {lesson.title}
              </h2>

              {lesson.description && (
                <p className="mt-3 text-slate-400">
                  {lesson.description}
                </p>
              )}

            </div>

            <Mic
              size={38}
              className="text-green-400"
            />

          </div>

          {lesson.example_sentence && (

            <div className="mt-6 rounded-2xl bg-slate-800 p-5">

              <h3 className="mb-3 flex items-center gap-2 font-bold text-green-400">
                <MessageCircle size={18} />
                Practice Sentence
              </h3>

              <p className="text-slate-300">
                {lesson.example_sentence}
              </p>

            </div>

          )}

          {lesson.audio_url && (

            <audio
              controls
              className="mt-6 w-full"
            >
              <source
                src={lesson.audio_url}
                type="audio/mpeg"
              />
            </audio>

          )}

          <button
            className="mt-6 flex items-center gap-3 rounded-2xl bg-green-600 px-6 py-3 font-bold transition hover:bg-green-500"
          >
            <Mic size={18} />
            Start Speaking
          </button>

          <button
            className="mt-4 flex items-center gap-3 rounded-2xl bg-violet-600 px-6 py-3 font-bold transition hover:bg-violet-500"
          >
            <Sparkles size={18} />
            Practice with AI
          </button>

          <button
            className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-700 px-6 py-3 font-bold transition hover:bg-slate-600"
          >
            <Volume2 size={18} />
            Hear Native Pronunciation
          </button>

        </div>

      ))}

    </div>
  );
}