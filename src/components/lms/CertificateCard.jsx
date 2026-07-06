import React from "react";
import {
  Award,
  Download,
  Eye,
  ShieldCheck,
  Calendar,
  User,
  BadgeCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const CertificateCard = ({
  course,
  student,
  issueDate,
  certificateId,
  grade,
  verified = true,
  onPreview,
  onDownload,
}) => {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 hover:border-yellow-500"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 p-8">

        <Award
          size={56}
          className="text-white"
        />

        <h2 className="mt-5 text-3xl font-bold">
          {course}
        </h2>

        <p className="text-white/80 mt-2">
          Certificate of Completion
        </p>

      </div>

      {/* Body */}
      <div className="p-6 space-y-5">

        <div className="flex items-center gap-3">

          <User className="text-blue-400" />

          <div>

            <p className="text-slate-500 text-sm">
              Student
            </p>

            <p>{student}</p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <Calendar className="text-emerald-400" />

          <div>

            <p className="text-slate-500 text-sm">
              Issued
            </p>

            <p>{issueDate}</p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <BadgeCheck className="text-purple-400" />

          <div>

            <p className="text-slate-500 text-sm">
              Grade
            </p>

            <p>{grade}</p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <ShieldCheck
            className={
              verified
                ? "text-green-400"
                : "text-red-400"
            }
          />

          <div>

            <p className="text-slate-500 text-sm">
              Verification
            </p>

            <p>
              {verified
                ? "Verified"
                : "Not Verified"}
            </p>

          </div>

        </div>

        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">

          <p className="text-slate-500 text-sm">
            Certificate ID
          </p>

          <p className="font-mono mt-2">
            {certificateId}
          </p>

        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 p-5 flex gap-4">

        <button
          onClick={onPreview}
          className="flex-1 rounded-2xl bg-slate-800 hover:bg-slate-700 py-3 flex justify-center items-center gap-2 transition"
        >
          <Eye size={18} />

          Preview

        </button>

        <button
          onClick={onDownload}
          className="flex-1 rounded-2xl bg-yellow-600 hover:bg-yellow-700 py-3 flex justify-center items-center gap-2 transition"
        >
          <Download size={18} />

          Download

        </button>

      </div>

    </motion.div>
  );
};

export default CertificateCard;