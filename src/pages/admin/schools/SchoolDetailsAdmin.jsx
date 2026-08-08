import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../../lib/supabaseClient";

import {
  ArrowLeft,
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  GraduationCap,
  School,
  Wrench,
  Loader2,
  Pencil,
  BookOpen,
} from "lucide-react";

import FacultyManager from "./FacultyManager";

/* =========================================================
   SCHOOL DETAILS ADMIN
========================================================= */

const SchoolDetailsAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     FETCH SCHOOL
  ========================================================= */

  const fetchSchool = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      let result;

      /*
        Try universities first
      */
      result = await supabase
        .from("universities")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (result.data) {
        setSchool({
          ...result.data,
          school_type: "University",
        });

        return;
      }

      /*
        Try colleges
      */
      result = await supabase
        .from("colleges")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (result.data) {
        setSchool({
          ...result.data,
          school_type: "College",
        });

        return;
      }

      /*
        Try polytechnics
      */
      result = await supabase
        .from("polytechnics")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (result.data) {
        setSchool({
          ...result.data,
          school_type: "Polytechnic",
        });

        return;
      }

      setSchool(null);
    } catch (error) {
      console.error("School Details Error:", error);
      setSchool(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchool();
  }, [id]);

  /* =========================================================
     SCHOOL ICON
  ========================================================= */

  const getSchoolIcon = () => {
    if (school?.school_type === "University") {
      return GraduationCap;
    }

    if (school?.school_type === "Polytechnic") {
      return Wrench;
    }

    return School;
  };

  const SchoolIcon = getSchoolIcon();

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-950">
        <Loader2
          size={35}
          className="animate-spin text-cyan-400"
        />
      </div>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!school) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-12 text-center">
          <Building2
            size={45}
            className="mx-auto text-slate-600"
          />

          <h2 className="mt-5 text-2xl font-black">
            School Not Found
          </h2>

          <p className="mt-2 text-slate-500">
            The school you're looking for could not be found.
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <section className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <button
          onClick={() =>
            navigate(
              `/admin/schools/${school.school_type.toLowerCase()}/edit/${school.id}`
            )
          }
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
        >
          <Pencil size={17} />
          Edit School
        </button>
      </div>

      {/* =====================================================
          SCHOOL HERO
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 shadow-2xl"
      >
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-7 md:flex-row md:items-center">
          {/* ICON */}

          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10">
            <SchoolIcon
              size={52}
              className="text-cyan-400"
            />
          </div>

          {/* INFO */}

          <div className="min-w-0">
            <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400">
              {school.school_type}
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
              {school.name ||
                school.school_name ||
                "Unnamed School"}
            </h1>

            {school.short_name && (
              <p className="mt-2 text-lg font-semibold text-slate-400">
                {school.short_name}
              </p>
            )}

            {school.description && (
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
                {school.description}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* =====================================================
          INFORMATION GRID
      ===================================================== */}

      <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {/* LOCATION */}

        <InfoCard
          icon={MapPin}
          title="Location"
          value={
            school.location ||
            school.address ||
            school.city ||
            "Not provided"
          }
        />

        {/* WEBSITE */}

        <InfoCard
          icon={Globe}
          title="Website"
          value={school.website || "Not provided"}
          link={school.website}
        />

        {/* EMAIL */}

        <InfoCard
          icon={Mail}
          title="Email"
          value={school.email || "Not provided"}
          link={
            school.email
              ? `mailto:${school.email}`
              : null
          }
        />

        {/* PHONE */}

        <InfoCard
          icon={Phone}
          title="Phone"
          value={school.phone || "Not provided"}
          link={
            school.phone
              ? `tel:${school.phone}`
              : null
          }
        />
      </div>

      {/* =====================================================
          ACADEMIC SUMMARY
      ===================================================== */}

      <div className="mb-8 rounded-3xl border border-white/10 bg-slate-900/70 p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
            <BookOpen
              size={21}
              className="text-blue-400"
            />
          </div>

          <div>
            <h2 className="text-xl font-black">
              Academic Information
            </h2>

            <p className="text-sm text-slate-500">
              General information about this institution.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBox
            label="Established"
            value={
              school.established_year ||
              school.founded_year ||
              "—"
            }
          />

          <StatBox
            label="State"
            value={school.state || "—"}
          />

          <StatBox
            label="Country"
            value={school.country || "Nigeria"}
          />

          <StatBox
            label="Status"
            value={
              school.active === false
                ? "Inactive"
                : "Active"
            }
          />
        </div>
      </div>

      {/* =====================================================
          FACULTIES
      ===================================================== */}

      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-7">
        <FacultyManager
          schoolId={school.id}
          schoolType={school.school_type}
        />
      </div>
    </section>
  );
};

/* =========================================================
   INFO CARD
========================================================= */

const InfoCard = ({
  icon: Icon,
  title,
  value,
  link,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
          <Icon
            size={18}
            className="text-cyan-400"
          />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
      </div>

      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block truncate text-sm font-semibold text-cyan-400 hover:text-cyan-300"
        >
          {value}
        </a>
      ) : (
        <p className="mt-4 truncate text-sm font-semibold text-slate-200">
          {value}
        </p>
      )}
    </div>
  );
};

/* =========================================================
   STAT BOX
========================================================= */

const StatBox = ({ label, value }) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-lg font-black text-white">
        {value}
      </p>
    </div>
  );
};

export default SchoolDetailsAdmin;