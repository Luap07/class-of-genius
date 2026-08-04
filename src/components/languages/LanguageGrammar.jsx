import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../../lib/supabaseClient";

import GrammarHero from "../../components/languages/GrammarHero";
import GrammarSearch from "../../components/languages/GrammarSearch";
import GrammarCard from "../../components/languages/GrammarCard";
import GrammarLoading from "../../components/languages/GrammarLoading";
import GrammarEmpty from "../../components/languages/GrammarEmpty";
import GrammarStats from "../../components/languages/GrammarStats";

export default function LanguageGrammar({
  language,
}) {
  const [grammar, setGrammar] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    if (!language) return;

    fetchGrammar();
  }, [language]);

  async function fetchGrammar() {
    setLoading(true);

    let query = supabase
      .from("language_grammar")
      .select("*");

    if (language?.id) {
      query = query.eq(
        "language_id",
        language.id
      );
    }

    const { data, error } =
      await query;

    if (error) {
      console.error(error);
    } else {
      setGrammar(data || []);
    }

    setLoading(false);
  }

  const categories = useMemo(() => {
    return [
      ...new Set(
        grammar
          .map((g) => g.category)
          .filter(Boolean)
      ),
    ];
  }, [grammar]);

  const filteredGrammar =
    useMemo(() => {
      return grammar.filter((item) => {
        const matchSearch =
          search === ""
            ? true
            : (
                item.title || ""
              )
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                );

        const matchCategory =
          category === "All"
            ? true
            : item.category ===
              category;

        return (
          matchSearch &&
          matchCategory
        );
      });
    }, [
      grammar,
      search,
      category,
    ]);

  if (loading) {
    return (
      <div className="space-y-10">
        <GrammarLoading />
      </div>
    );
  }

  return (
    <div className="space-y-10">

      <GrammarHero
        language={language}
        totalTopics={
          grammar.length
        }
      />

      <GrammarStats
        grammar={grammar}
      />

      <GrammarSearch
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        categories={categories}
      />

      {filteredGrammar.length ===
      0 ? (
        <GrammarEmpty />
      ) : (
        <div
          className="
            grid
            gap-8
            xl:grid-cols-2
          "
        >
          {filteredGrammar.map(
            (item) => (
              <GrammarCard
                key={item.id}
                item={item}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}