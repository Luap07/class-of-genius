import React, { useEffect, useState } from "react";
import {
  Globe2,
  MapPin,
  Calendar,
  Music,
  Utensils,
  Landmark,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function LanguageCulture({ language }) {
  const [culture, setCulture] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!language) return;

    const fetchCulture = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("language_culture")
          .select("*")
          .eq("language_id", language.id)
          .order("created_at", {
            ascending: false,
          });

        if (error) throw error;

        setCulture(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCulture();
  }, [language]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        Loading culture...
      </div>
    );
  }

  if (culture.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-12 text-center">
        <Globe2 className="mx-auto h-16 w-16 text-cyan-400" />

        <h2 className="mt-6 text-3xl font-black">
          No Culture Content Yet
        </h2>

        <p className="mt-4 text-slate-400">
          Upload culture materials from the Language CMS.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">

      {culture.map((item) => (

        <div
          key={item.id}
          className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
        >

          {item.image_url && (
            <img
              src={item.image_url}
              alt={item.title}
              className="h-64 w-full object-cover"
            />
          )}

          <div className="p-8">

            <div className="flex items-center gap-3">

              <Globe2 className="text-cyan-400" />

              <h2 className="text-2xl font-black">
                {item.title}
              </h2>

            </div>

            {item.description && (
              <p className="mt-5 leading-8 text-slate-300">
                {item.description}
              </p>
            )}

            <div className="mt-8 grid gap-4">

              {item.country && (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-800 p-4">
                  <MapPin className="text-cyan-400" />
                  <span>{item.country}</span>
                </div>
              )}

              {item.festival && (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-800 p-4">
                  <Calendar className="text-yellow-400" />
                  <span>{item.festival}</span>
                </div>
              )}

              {item.food && (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-800 p-4">
                  <Utensils className="text-orange-400" />
                  <span>{item.food}</span>
                </div>
              )}

              {item.music && (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-800 p-4">
                  <Music className="text-pink-400" />
                  <span>{item.music}</span>
                </div>
              )}

              {item.history && (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-800 p-4">
                  <Landmark className="text-indigo-400" />
                  <span>{item.history}</span>
                </div>
              )}

            </div>

          </div>

        </div>

      ))}

    </div>
  );
}