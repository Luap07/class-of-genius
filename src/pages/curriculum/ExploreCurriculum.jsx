import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe2 } from "lucide-react";

/* COMPONENTS */
import FilterBar from "../../components/Curriculum/explore/FilterBar";
import CurriculumGrid from "../../components/Curriculum/explore/CurriculumGrid";
import Recommended from "../../components/Curriculum/explore/Recommended";

const ExploreCurriculum = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("All");
  const [level, setLevel] = useState("All");

  const curricula = useMemo(
    () => [
      { id: "nigeria", country: "Nigeria", curriculum: "WAEC / NECO / NABTEB", level: "Secondary", subjects: 15 },
      { id: "usa", country: "USA", curriculum: "Common Core Standards", level: "Primary", subjects: 12 },
      { id: "uk", country: "UK", curriculum: "National Curriculum (GCSE/A-Level)", level: "Secondary", subjects: 14 },
      { id: "canada", country: "Canada", curriculum: "Provincial Curriculum Framework", level: "Primary", subjects: 11 },
      { id: "india", country: "India", curriculum: "CBSE / ICSE System", level: "Secondary", subjects: 16 },
      { id: "south-africa", country: "South Africa", curriculum: "CAPS Curriculum", level: "Secondary", subjects: 13 },
      { id: "kenya", country: "Kenya", curriculum: "CBC Curriculum", level: "Primary", subjects: 10 },
      { id: "ghana", country: "Ghana", curriculum: "NaCCA Curriculum", level: "Secondary", subjects: 12 },
      { id: "australia", country: "Australia", curriculum: "Australian Curriculum", level: "Primary", subjects: 11 },
      { id: "germany", country: "Germany", curriculum: "Bildungsplan System", level: "Secondary", subjects: 13 },
      { id: "france", country: "France", curriculum: "Éducation Nationale", level: "Secondary", subjects: 13 },
      { id: "china", country: "China", curriculum: "National Curriculum Standards", level: "Secondary", subjects: 14 },
      { id: "japan", country: "Japan", curriculum: "MEXT Curriculum", level: "Primary", subjects: 10 },
      { id: "brazil", country: "Brazil", curriculum: "BNCC Curriculum", level: "Secondary", subjects: 12 },
    ],
    []
  );

  const filtered = curricula.filter((item) => {
    const matchQuery =
      item.curriculum.toLowerCase().includes(query.toLowerCase()) ||
      item.country.toLowerCase().includes(query.toLowerCase());

    const matchCountry = country === "All" || item.country === country;
    const matchLevel = level === "All" || item.level === level;

    return matchQuery && matchCountry && matchLevel;
  });

  const recommended = useMemo(() => curricula.slice(0, 6), [curricula]);

  return (
    <div className="relative min-h-screen text-white bg-[#0B0F19] px-6 py-10">

      <div className="relative max-w-6xl mx-auto z-10">

        <h1 className="text-4xl font-black flex items-center gap-2">
          <Globe2 className="text-cyan-400" />
          Explore Curriculum
        </h1>

        <p className="text-slate-400 mt-2">
          Search, filter and compare global education systems
        </p>

        <FilterBar
          query={query}
          setQuery={setQuery}
          country={country}
          setCountry={setCountry}
          level={level}
          setLevel={setLevel}
        />

        {/* ✅ FIXED NAVIGATION HERE */}
        <CurriculumGrid
          data={filtered}
          onView={(item) =>
            navigate(`/curriculum/${item.id}`)
          }
        />

        <Recommended
          data={recommended}
          onView={(item) =>
            navigate(`/curriculum/${item.id}`)
          }
        />

        <div className="mt-16 text-center text-slate-500 text-sm border-t border-slate-800 pt-6">
          Powered by <span className="text-cyan-400 font-semibold">Scholiqen</span>
        </div>

      </div>
    </div>
  );
};

export default ExploreCurriculum;