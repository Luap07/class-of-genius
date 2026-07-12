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


  const allCategories = [
    {
      id: "all",
      name: "All",
    },
    ...categories,
  ];



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


      <div
        className="
          mb-5
          flex
          items-center
          gap-3
        "
      >

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

        {allCategories.map((item)=>(


          <button

            key={item.id}

            onClick={() =>
              onSelect?.(item.id)
            }

            className={`
              rounded-2xl
              px-5
              py-3
              font-semibold
              transition

              ${
                selected === item.id

                ?

                "bg-blue-600 text-white"

                :

                "bg-slate-800 text-slate-300 hover:bg-slate-700"

              }

            `}
          >

            {item.name}

          </button>


        ))}


      </div>



    </motion.div>

  );

};


export default CourseFilters;