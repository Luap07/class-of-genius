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
    title = "Untitled Certificate",
    course = "Unknown Course",
    issuer = "Wonder Learning",
    issueDate = "Not Issued",
    credentialId = "N/A",
    thumbnail = "",
    verified = true,
  } = certificate;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="
        rounded-3xl
        overflow-hidden
        border
        border-slate-800
        bg-slate-900
      "
    >
      {/* Certificate Preview */}

      <div className="h-48 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center">

        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Award
            size={90}
            className="text-white"
          />
        )}

      </div>

      {/* Body */}

      <div className="p-6">

        <h2 className="text-xl font-bold">
          {title}
        </h2>

        <p className="mt-2 text-slate-400">
          {course}
        </p>

        <div className="mt-5 space-y-3">

          <div className="flex items-center gap-3 text-slate-300">

            <Building2
              size={18}
              className="text-blue-400"
            />

            <span>{issuer}</span>

          </div>

          <div className="flex items-center gap-3 text-slate-300">

            <CalendarDays
              size={18}
              className="text-cyan-400"
            />

            <span>{issueDate}</span>

          </div>

          <div className="flex items-center gap-3 text-slate-300">

            <ShieldCheck
              size={18}
              className="text-emerald-400"
            />

            <span>
              {verified ? "Verified" : "Unverified"}
            </span>

          </div>

        </div>

        <div className="mt-6 rounded-2xl bg-slate-950 border border-slate-800 p-4">

          <p className="text-xs text-slate-500">
            Credential ID
          </p>

          <p className="mt-1 text-sm break-all">
            {credentialId || id}
          </p>

        </div>

        <div className="mt-6 flex gap-3">

          <button
            onClick={() => onView?.(certificate)}
            className="
              flex-1
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-blue-600
              hover:bg-blue-700
              transition
              py-3
              font-semibold
            "
          >
            <Eye size={18} />
            View
          </button>

          <button
            onClick={() => onDownload?.(certificate)}
            className="
              flex-1
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-slate-700
              hover:bg-slate-800
              transition
              py-3
              font-semibold
            "
          >
            <Download size={18} />
            Download
          </button>

        </div>

      </div>

    </motion.div>
  );
};

export default CertificateCard;