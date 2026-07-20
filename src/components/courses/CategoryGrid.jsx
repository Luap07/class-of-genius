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
  categories,
  navigate,
}) {
  return (
    <section className="mt-16">

      <div className="mb-10">
        <h2 className="text-4xl font-black">
          Browse Categories
        </h2>

        <p className="mt-3 text-slate-400">
          Select a category to discover subjects,
          courses and learning paths.
        </p>
      </div>


      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="
          grid
          gap-8
          lg:grid-cols-3
        "
      >

        {categories.map((category) => (

          <CategoryCard
            key={category.id}
            category={category}
            onClick={() =>
              navigate(`/courses/${category.id}`)
            }
          />

        ))}

      </motion.div>

    </section>
  );
}