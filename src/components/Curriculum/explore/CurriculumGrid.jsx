// src/components/curriculum/CurriculumGrid.jsx

import React from "react";
import CurriculumCard from "./CurriculumCard";

const CurriculumGrid = ({ data = [], onView }) => {
  return (
    <div className="mt-10">

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {data.map((item) => (
          <CurriculumCard
            key={item.id}
            data={item}
            onView={onView}
          />
        ))}

      </div>

      {/* EMPTY STATE */}
      {data.length === 0 && (
        <div className="text-center mt-20 text-slate-500">
          No curriculum found.
        </div>
      )}

    </div>
  );
};

export default CurriculumGrid;