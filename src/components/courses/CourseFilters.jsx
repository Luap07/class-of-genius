import React from "react";
import { motion } from "framer-motion";
import {
  Filter,
} from "lucide-react";

const CourseFilters = ({
  categories = [],
  selected = "All",
  onSelect,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        p-6
      "
    >

      <div className="flex items-center gap-3 mb-5">

        <Filter
          size={24}
          className="text-blue-400"
        />

        <h2 className="text-xl font-bold">
          Explore Categories
        </h2>

      </div>


      <div
        className="
          flex
          flex-wrap
          gap-3
        "
      >

        {categories.map((item) => (

          <button
            key={item}
            onClick={() => onSelect?.(item)}
            className={`
              px-5
              py-3
              rounded-2xl
              font-semibold
              transition
              ${
                selected === item
                ? 
                "bg-blue-600 text-white"
                :
                "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }
            `}
          >

            {item}

          </button>

        ))}

      </div>


    </motion.div>
  );
};

export default CourseFilters;