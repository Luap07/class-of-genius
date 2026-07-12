import React from "react";
import { Star } from "lucide-react";


const RatingStar = ({
  active = false,
  onClick,
  size = 32,
}) => {


  return (

    <button
      type="button"
      onClick={onClick}
      className="
        transition
        hover:scale-110
      "
    >

      <Star

        size={size}

        className={`
          transition
          ${
            active
              ? "fill-yellow-400 text-yellow-400"
              : "text-slate-600"
          }
        `}

      />

    </button>

  );

};



export default RatingStar;