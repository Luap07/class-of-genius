// src/components/lms/ProfileCard.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  UserCircle,
  Mail,
  GraduationCap,
  Award,
  BookOpen,
  Clock3,
  Trophy,
  Edit,
} from "lucide-react";

const ProfileCard = ({
  user = {},
  onEdit,
}) => {
  const {
    name = "Student",
    email = "student@example.com",
    level = "Learner",
    avatar = "",
    enrolledCourses = 0,
    completedCourses = 0,
    certificates = 0,
    studyHours = 0,
  } = user;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        overflow-hidden
      "
    >
      {/* Cover */}
      <div className="h-28 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600" />

      <div className="px-6 pb-6">

        {/* Avatar */}

        <div className="-mt-12 flex justify-between items-end">

          <div className="w-24 h-24 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800 flex items-center justify-center">

            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircle
                size={72}
                className="text-slate-400"
              />
            )}

          </div>

          <button
            onClick={onEdit}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              transition
              px-4
              py-2
              font-semibold
            "
          >
            <Edit size={18} />
            Edit
          </button>

        </div>

        {/* User Info */}

        <div className="mt-5">

          <h2 className="text-2xl font-bold">
            {name}
          </h2>

          <div className="mt-3 space-y-2 text-slate-400">

            <div className="flex items-center gap-2">
              <Mail size={16} />
              <span>{email}</span>
            </div>

            <div className="flex items-center gap-2">
              <GraduationCap size={16} />
              <span>{level}</span>
            </div>

          </div>

        </div>

        {/* Stats */}

        <div className="grid grid-cols-2 gap-4 mt-8">

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">
            <BookOpen className="text-blue-400 mb-2" />
            <h3 className="text-2xl font-bold">
              {enrolledCourses}
            </h3>
            <p className="text-slate-400 text-sm">
              Enrolled
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">
            <Award className="text-emerald-400 mb-2" />
            <h3 className="text-2xl font-bold">
              {completedCourses}
            </h3>
            <p className="text-slate-400 text-sm">
              Completed
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">
            <Trophy className="text-yellow-400 mb-2" />
            <h3 className="text-2xl font-bold">
              {certificates}
            </h3>
            <p className="text-slate-400 text-sm">
              Certificates
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">
            <Clock3 className="text-cyan-400 mb-2" />
            <h3 className="text-2xl font-bold">
              {studyHours}
            </h3>
            <p className="text-slate-400 text-sm">
              Study Hours
            </p>
          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default ProfileCard;