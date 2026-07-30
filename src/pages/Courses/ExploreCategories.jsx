// src/pages/courses/ExploreCategories.jsx

import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Cog from "../../assets/cog.png";
import {
  Atom,
  Laptop,
  Briefcase,
  Palette,
  Globe,
  HeartPulse,
  GraduationCap,
} from "lucide-react";

import { useCourses } from "../../context/LMSContext/CourseContext";

import CategoryStats from "../../components/courses/CategoriesStats";
import CategoryCard from "../../components/courses/CategoryCard";
import CategoryCTA from "../../components/courses/CategoriesCTA";
import CategoriesFooter from "../../components/courses/CategoriesFooter";

const ICON_MAP = {
  Science: Atom,
  Technology: Laptop,
  Business: Briefcase,
  Arts: Palette,
  Geography: Globe,
  Health: HeartPulse,
  University: GraduationCap,
};

export default function ExploreCategories() {
  const navigate = useNavigate();
  const categoryGridRef = useRef(null);

  const { categories = [], documents = [], loading } = useCourses();

  const [search, setSearch] = useState("");

  const formattedCategories = useMemo(() => {
    return categories.map((category) => {
      const Icon = ICON_MAP[category.name] || GraduationCap;

      const categoryDocuments = documents.filter(
        (doc) => String(doc.category_id) === String(category.id)
      );

      return {
        id: category.id,
        name: category.name,
        title: category.name,
        description: category.description || "Explore courses in this category.",
        icon: Icon,
        count: categoryDocuments.length,
        totalCourses: categoryDocuments.length,
        documents: categoryDocuments,
      };
    });
  }, [categories, documents]);

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return formattedCategories;

    return formattedCategories.filter(
      (category) =>
        category.name?.toLowerCase().includes(keyword) ||
        category.description?.toLowerCase().includes(keyword)
    );
  }, [search, formattedCategories]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#020617]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,116,144,.25),transparent_45%),radial-gradient(circle_at_90%_80%,rgba(37,99,235,.18),transparent_40%)]" />
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14 text-center"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-500/30 bg-cyan-500/10">
            <img src={Cog} alt="Scholiqen" className="h-12 w-12 object-contain" />
          </div>

          <h2 className="mt-5 text-2xl font-black text-cyan-400">SCHOLIQEN</h2>

          <h1 className="mt-4 text-5xl font-black">Explore Learning Categories</h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-400">
            Explore courses in every category and start learning.
          </p>
        </motion.section>

        {/* SEARCH */}
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-700 bg-slate-900/70 backdrop-blur-xl">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full bg-transparent px-6 py-5 outline-none placeholder:text-slate-500"
          />
        </div>

        {/* CATEGORY GRID FIRST */}
        <section className="mt-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
              Explore Courses In Each Category
            </h2>
            <p className="mt-2 text-slate-400 drop-shadow-[0_0_10px_rgba(148,163,184,0.4)]">
              Choose a category and discover available learning materials.
            </p>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
                <p className="text-slate-400">Loading Categories...</p>
              </div>
            </div>
          ) : (
            <div
              ref={categoryGridRef}
              className="grid gap-8 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onClick={() => navigate(`/courses/category/${category.id}`)}
                  />
                ))
              ) : (
                <div className="col-span-full rounded-3xl border border-dashed border-slate-700 p-16 text-center">
                  <h2 className="text-3xl font-bold">No Categories Found</h2>
                  <p className="mt-3 text-slate-400">
                    No learning categories are available.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* STATS NOW BELOW GRID */}
        <CategoryStats />

        
        <CategoryCTA
          scrollToCategories={() =>
            categoryGridRef.current?.scrollIntoView({
              behavior: "smooth",
            })
          }
        />

        <CategoriesFooter />
      </main>
    </div>
  );
}