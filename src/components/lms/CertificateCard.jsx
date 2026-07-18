// src/components/lms/CertificateCard.jsx

import React from "react";
import { motion } from "framer-motion";

import {
  Award,
  CalendarDays,
  Download,
  Eye,
  ShieldCheck,
  Building2,
} from "lucide-react";


const CertificateCard = ({
  certificate = {},
  onView,
  onDownload,
}) => {


  const {

    id,

    course = "Unknown Course",

    issueDate = "Not Issued",

    certificateId = "N/A",

    thumbnail = null,

    verified = true,

  } = certificate;



  const title = `${course} Certificate`;

  const issuer = "Class Of Genius";



  return (

    <motion.div

      whileHover={{
        y: -6,
      }}

      transition={{
        duration: 0.25,
      }}

      className="
        overflow-hidden
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
      "

    >


      {/* =========================
          CERTIFICATE PREVIEW
      ========================== */}

      <div
        className="
          flex
          h-48
          items-center
          justify-center
          bg-gradient-to-r
          from-amber-500
          via-orange-500
          to-yellow-400
        "
      >

        {
          thumbnail ? (

            <img

              src={thumbnail}

              alt={course}

              className="
                h-full
                w-full
                object-cover
              "

            />

          ) : (

            <Award

              size={90}

              className="text-white"

            />

          )

        }

      </div>



      {/* =========================
          BODY
      ========================== */}

      <div className="p-6">


        <h2 className="text-xl font-bold text-white">

          {title}

        </h2>


        <p className="mt-2 text-slate-400">

          {course}

        </p>




        <div className="mt-5 space-y-3">


          {/* Issuer */}

          <div className="flex items-center gap-3 text-slate-300">

            <Building2

              size={18}

              className="text-blue-400"

            />

            <span>

              {issuer}

            </span>

          </div>




          {/* Date */}

          <div className="flex items-center gap-3 text-slate-300">


            <CalendarDays

              size={18}

              className="text-cyan-400"

            />


            <span>

              {issueDate}

            </span>


          </div>





          {/* Verification */}

          <div className="flex items-center gap-3 text-slate-300">


            <ShieldCheck

              size={18}

              className="text-emerald-400"

            />


            <span>

              {
                verified

                ? "Verified Certificate"

                : "Not Verified"
              }

            </span>


          </div>


        </div>





        {/* Credential */}

        <div
          className="
            mt-6
            rounded-2xl
            border
            border-slate-800
            bg-slate-950
            p-4
          "
        >

          <p className="text-xs text-slate-500">

            Certificate Number

          </p>


          <p
            className="
              mt-1
              break-all
              text-sm
              text-white
            "
          >

            {certificateId || id}

          </p>


        </div>





        {/* ACTIONS */}

        <div className="mt-6 flex gap-3">


          <button

            onClick={() =>
              onView?.(certificate)
            }

            className="
              flex-1
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-blue-600
              py-3
              font-semibold
              text-white
              transition
              hover:bg-blue-500
            "

          >

            <Eye size={18}/>

            View

          </button>





          <button

            onClick={() =>
              onDownload?.(certificate)
            }

            className="
              flex-1
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-slate-700
              py-3
              font-semibold
              text-white
              transition
              hover:bg-slate-800
            "

          >

            <Download size={18}/>

            Download

          </button>


        </div>



      </div>


    </motion.div>

  );

};


export default CertificateCard;