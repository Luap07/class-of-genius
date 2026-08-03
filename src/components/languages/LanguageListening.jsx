import React, { useEffect, useState } from "react";
import {
  Headphones,
  Play,
  Clock,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function LanguageListening({
  language,
}) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!language) return;

    const fetchListening = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("language_listening")
          .select("*")
          .eq("language_id", language.id)
          .order("created_at", {
            ascending: false,
          });

        if (error) throw error;

        setTracks(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchListening();
  }, [language]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        Loading listening lessons...
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-12 text-center">
        <Headphones className="mx-auto h-16 w-16 text-cyan-400" />

        <h2 className="mt-6 text-3xl font-black">
          No Listening Lessons Yet
        </h2>

        <p className="mt-4 text-slate-400">
          Upload audio lessons from the Language CMS.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">

      {tracks.map((track) => (

        <div
          key={track.id}
          className="rounded-3xl border border-white/10 bg-slate-900 p-7 transition hover:border-cyan-500"
        >

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-black">
                {track.title}
              </h2>

              {track.description && (
                <p className="mt-3 text-slate-400">
                  {track.description}
                </p>
              )}

            </div>

            <Headphones
              className="text-cyan-400"
              size={34}
            />

          </div>

          {track.duration && (
            <div className="mt-5 flex items-center gap-2 text-slate-400">

              <Clock size={16} />

              <span>{track.duration}</span>

            </div>
          )}

          {track.audio_url && (
            <audio
              controls
              className="mt-6 w-full"
            >
              <source
                src={track.audio_url}
                type="audio/mpeg"
              />

              Your browser does not support audio.
            </audio>
          )}

          {track.transcript && (
            <div className="mt-6 rounded-2xl bg-slate-800 p-5">

              <h3 className="mb-3 font-bold text-cyan-400">
                Transcript
              </h3>

              <p className="leading-8 text-slate-300">
                {track.transcript}
              </p>

            </div>
          )}

          {track.audio_url && (
            <a
              href={track.audio_url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3 font-bold transition hover:bg-cyan-500"
            >
              <Play size={18} />
              Play Audio
            </a>
          )}

        </div>

      ))}

    </div>
  );
}