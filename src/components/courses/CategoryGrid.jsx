// src/components/courses/CategoryGrid.jsx

import React from "react";
import { motion } from "framer-motion";
import CategoryCard from "./CategoryCard";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function CategoryGrid({
  categories = [],
  navigate,
}) {
  if (!categories || categories.length === 0) {
    return (
      <div className="mt-16 rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">
        <h3 className="text-2xl font-bold text-white">
          No Categories Found
        </h3>

        <p className="mt-3 text-slate-400">
          Upload documents in Document Admin and assign them to a category.
          Categories will automatically appear here.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-16">
      <div className="mb-10">
        <h2 className="text-4xl font-black">
          Browse Categories
        </h2>

        <p className="mt-3 text-slate-400">
          Select a category to view every document uploaded for it.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-8 md:grid-cols-2 xl:grid-cols-3"
      >
        {categories.map((category) => (
          <CategoryCard
  key={category.id}
  category={category}
  onClick={() =>
    navigate(
      `/courses/${category.id}`
    )
  }
/>
        ))}
      </motion.div>
    </section>
  );
}