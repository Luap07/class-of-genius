import React from "react";


const InfoCard = ({
  title,
  description,
  icon: Icon,
  action,
  onClick
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


      {/* Icon */}

      {
        Icon && (

          <div
            className="
              w-12
              h-12
              rounded-xl
              bg-slate-800
              flex
              items-center
              justify-center
              text-blue-400
              mb-5
            "
          >

            <Icon size={24}/>

          </div>

        )
      }




      {/* Content */}

      <h3
        className="
          text-lg
          font-semibold
        "
      >

        {title}

      </h3>



      <p
        className="
          text-sm
          text-slate-400
          mt-2
          leading-relaxed
        "
      >

        {description}

      </p>





      {/* Action */}

      {
        action && (

          <button

            onClick={onClick}

            className="
              mt-5
              px-4
              py-2
              rounded-xl
              bg-blue-600
              hover:bg-blue-500
              transition
              text-sm
              font-medium
            "
          >

            {action}

          </button>

        )
      }




    </div>

  );

};



export default InfoCard;