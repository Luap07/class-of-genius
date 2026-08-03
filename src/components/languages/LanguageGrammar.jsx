import React, { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function LanguageGrammar({
  language,
}) {
  const [grammar, setGrammar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!language) return;

    const fetchGrammar = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("language_grammar")
          .select("*")
          .eq("language_id", language.id)
          .order("position", {
            ascending: true,
          });

        if (error) throw error;

        setGrammar(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrammar();
  }, [language]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        Loading grammar...
      </div>
    );
  }

  if (grammar.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-12 text-center">
        <BookOpen className="mx-auto h-14 w-14 text-blue-400" />

        <h2 className="mt-6 text-3xl font-black">
          No Grammar Topics Yet
        </h2>

        <p className="mt-4 text-slate-400">
          Upload grammar lessons from the Language CMS.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {grammar.map((item) => (

        <div
          key={item.id}
          className="rounded-3xl border border-white/10 bg-slate-900 p-8 transition hover:border-blue-500"
        >

          <div className="flex items-center gap-4">

            <BookOpen className="text-blue-400" />

            <h2 className="text-2xl font-black">
              {item.title}
            </h2>

          </div>

          {item.description && (
            <p className="mt-5 leading-8 text-slate-300">
              {item.description}
            </p>
          )}

          {item.example && (
            <div className="mt-6 rounded-2xl bg-slate-800 p-5">

              <h3 className="mb-2 font-bold text-blue-400">
                Example
              </h3>

              <p className="text-slate-300">
                {item.example}
              </p>

            </div>
          )}

          {item.notes && (
            <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">

              <h3 className="mb-2 font-bold text-yellow-400">
                Notes
              </h3>

              <p className="text-slate-300">
                {item.notes}
              </p>

            </div>
          )}

        </div>

      ))}

    </div>
  );
}