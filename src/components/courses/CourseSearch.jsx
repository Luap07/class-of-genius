import React from "react";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";

const CourseSearch = ({
  value = "",
  onChange,
}) => {
  const handleClear = () => {
    if (onChange) {
      onChange("");
    }
  };

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
      <div className="flex flex-col lg:flex-row gap-6 items-center">

        <div className="relative flex-1 w-full">

          <Search
            size={22}
            className="
              absolute
              left-5
              top-1/2
              -translate-y-1/2
              text-slate-500
            "
          />

          <input
            type="text"
            value={value}
            onChange={(e) =>
              onChange?.(e.target.value)
            }
            placeholder="Search for courses, subjects, skills, universities..."
            className="
              w-full
              rounded-2xl
              border
              border-slate-700
              bg-slate-950
              pl-14
              pr-14
              py-4
              outline-none
              focus:border-blue-500
              transition
            "
          />

          {value && (
            <button
              onClick={handleClear}
              className="
                absolute
                right-5
                top-1/2
                -translate-y-1/2
                text-slate-500
                hover:text-white
              "
            >
              <X size={20} />
            </button>
          )}

        </div>

        <button
          className="
            rounded-2xl
            bg-blue-600
            hover:bg-blue-700
            transition
            px-8
            py-4
            font-semibold
          "
        >
          Search
        </button>

      </div>
    </motion.div>
  );
};

export default CourseSearch;