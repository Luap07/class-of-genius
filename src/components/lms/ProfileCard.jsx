import React from "react";
import {
  Camera,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  BookOpen,
  Award,
  Flame,
  Clock3,
  Edit3,
} from "lucide-react";
import { motion } from "framer-motion";

const ProfileCard = ({
  name,
  email,
  phone,
  location,
  level,
  joined,
  avatar,
  courses = 0,
  certificates = 0,
  streak = 0,
  hours = 0,
  onEdit,
  onUpload,
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900"
    >
      {/* Cover */}
      <div className="h-36 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700" />

      {/* Profile */}
      <div className="px-8 pb-8">

        <div className="-mt-16 flex flex-col lg:flex-row lg:justify-between lg:items-end">

          <div className="flex items-end gap-5">

            <div className="relative">

              <img
                src={avatar}
                alt={name}
                className="w-32 h-32 rounded-full border-4 border-slate-900 object-cover"
              />

              <button
                onClick={onUpload}
                className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 rounded-full p-2"
              >
                <Camera size={18} />
              </button>

            </div>

            <div>

              <h2 className="text-3xl font-bold">
                {name}
              </h2>

              <p className="text-slate-400">
                {level}
              </p>

            </div>

          </div>

          <button
            onClick={onEdit}
            className="mt-6 lg:mt-0 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Edit3 size={18} />
            Edit Profile
          </button>

        </div>

        {/* Details */}

        <div className="grid md:grid-cols-2 gap-5 mt-10">

          <Info icon={<Mail />} label="Email" value={email} />

          <Info icon={<Phone />} label="Phone" value={phone} />

          <Info icon={<MapPin />} label="Location" value={location} />

          <Info
            icon={<Calendar />}
            label="Joined"
            value={joined}
          />

        </div>

        {/* Stats */}

        <div className="grid md:grid-cols-4 gap-5 mt-10">

          <Stat
            icon={<BookOpen className="text-blue-400" />}
            title="Courses"
            value={courses}
          />

          <Stat
            icon={<Award className="text-yellow-400" />}
            title="Certificates"
            value={certificates}
          />

          <Stat
            icon={<Flame className="text-red-400" />}
            title="Streak"
            value={`${streak} Days`}
          />

          <Stat
            icon={<Clock3 className="text-cyan-400" />}
            title="Study Hours"
            value={hours}
          />

        </div>

        {/* Academic */}

        <div className="rounded-2xl bg-slate-950 border border-slate-800 mt-10 p-6">

          <div className="flex items-center gap-3 mb-5">

            <GraduationCap className="text-blue-400" />

            <h3 className="text-xl font-semibold">
              Academic Status
            </h3>

          </div>

          <div className="flex justify-between mb-3">

            <span className="text-slate-400">
              Overall Completion
            </span>

            <span>78%</span>

          </div>

          <div className="h-3 rounded-full bg-slate-800 overflow-hidden">

            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
              style={{
                width: "78%",
              }}
            />

          </div>

        </div>

      </div>

    </motion.div>
  );
};

const Info = ({ icon, label, value }) => (
  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 flex gap-4">
    <div className="text-blue-400">{icon}</div>

    <div>
      <p className="text-slate-500 text-sm">
        {label}
      </p>

      <p>{value}</p>
    </div>
  </div>
);

const Stat = ({ icon, title, value }) => (
  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 text-center">

    <div className="flex justify-center mb-4">
      {icon}
    </div>

    <h3 className="text-3xl font-bold">
      {value}
    </h3>

    <p className="text-slate-400 mt-2">
      {title}
    </p>

  </div>
);

export default ProfileCard;