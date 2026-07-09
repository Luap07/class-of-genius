import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";


const AnalyticsCard = ({
  title,
  value,
  percentage,
  description,
  icon: Icon,
  trend = "up"
}) => {


  return (

    <div
      className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-6
        hover:border-blue-500/40
        transition
      "
    >


      {/* Header */}

      <div
        className="
          flex
          justify-between
          items-start
        "
      >


        <div>

          <p
            className="
              text-sm
              text-slate-400
            "
          >

            {title}

          </p>


          <h2
            className="
              text-3xl
              font-bold
              mt-2
            "
          >

            {value}

          </h2>


        </div>



        <div
          className="
            w-12
            h-12
            rounded-xl
            bg-blue-500/10
            text-blue-400
            flex
            items-center
            justify-center
          "
        >

          {
            Icon &&
            <Icon size={24}/>
          }

        </div>



      </div>





      {/* Trend */}

      <div
        className="
          flex
          items-center
          gap-2
          mt-5
        "
      >


        {
          trend === "up"
          ?

          <ArrowUpRight
            size={18}
            className="text-green-400"
          />

          :

          <ArrowDownRight
            size={18}
            className="text-red-400"
          />

        }



        <span
          className={`
            text-sm
            font-medium
            ${
              trend === "up"
              ?
              "text-green-400"
              :
              "text-red-400"
            }
          `}
        >

          {percentage}

        </span>


        <span
          className="
            text-sm
            text-slate-500
          "
        >

          {description}

        </span>



      </div>



    </div>

  );

};



export default AnalyticsCard;