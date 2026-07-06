// src/components/curriculum/FilterBar.jsx

import React from "react";
import { Search } from "lucide-react";

const FilterBar = ({
  query,
  setQuery,
  country,
  setCountry,
  level,
  setLevel,
}) => {
  return (
    <div className="mt-6 flex flex-col md:flex-row gap-4">

      {/* SEARCH */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl w-full">
        <Search size={18} className="text-slate-400" />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search curriculum or country..."
          className="bg-transparent outline-none w-full text-white placeholder:text-slate-500"
        />
      </div>

      {/* COUNTRY FILTER */}
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl text-white"
      >
        <option value="All">All Countries</option>

        {/* AFRICA */}
        <optgroup label="Africa">
          <option value="Nigeria">Nigeria</option>
          <option value="Ghana">Ghana</option>
          <option value="Kenya">Kenya</option>
          <option value="South Africa">South Africa</option>
          <option value="Egypt">Egypt</option>
          <option value="Morocco">Morocco</option>
          <option value="Ethiopia">Ethiopia</option>
        </optgroup>

        {/* EUROPE */}
        <optgroup label="Europe">
          <option value="United Kingdom">United Kingdom</option>
          <option value="France">France</option>
          <option value="Germany">Germany</option>
          <option value="Italy">Italy</option>
          <option value="Spain">Spain</option>
          <option value="Netherlands">Netherlands</option>
        </optgroup>

        {/* NORTH AMERICA */}
        <optgroup label="North America">
          <option value="USA">USA</option>
          <option value="Canada">Canada</option>
          <option value="Mexico">Mexico</option>
        </optgroup>

        {/* ASIA */}
        <optgroup label="Asia">
          <option value="India">India</option>
          <option value="China">China</option>
          <option value="Japan">Japan</option>
          <option value="South Korea">South Korea</option>
          <option value="Indonesia">Indonesia</option>
        </optgroup>

        {/* SOUTH AMERICA */}
        <optgroup label="South America">
          <option value="Brazil">Brazil</option>
          <option value="Argentina">Argentina</option>
          <option value="Chile">Chile</option>
        </optgroup>

        {/* OCEANIA */}
        <optgroup label="Oceania">
          <option value="Australia">Australia</option>
          <option value="New Zealand">New Zealand</option>
        </optgroup>
      </select>

      {/* LEVEL FILTER */}
      <select
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl text-white"
      >
        <option value="All">All Levels</option>
        <option value="Primary">Primary</option>
        <option value="Secondary">Secondary</option>
        <option value="Tertiary">Tertiary</option>
      </select>

    </div>
  );
};

export default FilterBar;