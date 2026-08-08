// src/pages/CollegeDetails.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  School,
  MapPin,
  Globe,
  BookOpen,
  GraduationCap,
  Building2,
  Mail,
  Phone,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const CollegeDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     FETCH COLLEGE
  ========================================================= */

  useEffect(() => {
    fetchCollege();
  }, [id]);

  const fetchCollege = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("colleges")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("College Details Error:", error);
        setCollege(null);
        return;
      }

      setCollege(data);
    } catch (error) {
      console.error("College Details Error:", error);
      setCollege(null);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <section className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-800" />

          <div className="mt-8 h-96 animate-pulse rounded-3xl bg-slate-900" />

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="h-48 animate-pulse rounded-3xl bg-slate-900" />
            <div className="h-48 animate-pulse rounded-3xl bg-slate-900" />
          </div>
        </div>
      </section>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!college) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
        <div>
          <School
            size={60}
            className="mx-auto text-slate-700"
          />

          <h1 className="mt-6 text-3xl font-black">
            College Not Found
          </h1>

          <p className="mt-3 text-slate-500">
            The college information could not be found.
          </p>

          <button
            onClick={() => navigate("/colleges")}
            className="mt-7 rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Back to Colleges
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-10">

      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            BACK
        ===================================================== */}

        <button
          onClick={() => navigate("/colleges")}
          className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Colleges
        </button>

        {/* =====================================================
            HERO
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
          transition={{
            duration: 0.5,
          }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
        >

          {/* IMAGE */}

          <div className="relative h-[360px] sm:h-[440px]">

            {college.image_url ? (
              <img
                src={college.image_url}
                alt={college.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950">
                <School
                  size={120}
                  className="text-cyan-400/20"
                />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

            {/* HERO CONTENT */}

            <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-10">

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-400 backdrop-blur-md">
                <School size={16} />
                College
              </div>

              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                {college.name}
              </h1>

              {(college.location ||
                college.state ||
                college.country) && (
                <div className="mt-4 flex items-center gap-2 text-slate-300">
                  <MapPin
                    size={18}
                    className="text-cyan-400"
                  />

                  <span>
                    {[
                      college.location,
                      college.state,
                      college.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}

            </div>
          </div>
        </motion.div>

        {/* =====================================================
            BASIC INFORMATION
        ===================================================== */}

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <InfoCard
            icon={School}
            title="Institution Type"
            value="College"
          />

          <InfoCard
            icon={MapPin}
            title="Location"
            value={
              [
                college.location,
                college.state,
              ]
                .filter(Boolean)
                .join(", ") || "Not provided"
            }
          />

          <InfoCard
            icon={GraduationCap}
            title="Programs"
            value={
              Array.isArray(college.programs)
                ? `${college.programs.length} Programs`
                : college.programs_count
                  ? `${college.programs_count} Programs`
                  : "Available programs"
            }
          />

          <InfoCard
            icon={CalendarDays}
            title="Established"
            value={
              college.established_year ||
              college.established ||
              "Not provided"
            }
          />

        </div>

        {/* =====================================================
            ABOUT
        ===================================================== */}

        {college.description && (
          <SectionCard
            icon={BookOpen}
            title="About the College"
          >
            <p className="leading-8 text-slate-400">
              {college.description}
            </p>
          </SectionCard>
        )}

        {/* =====================================================
            FACULTIES
        ===================================================== */}

        {Array.isArray(college.faculties) && (
          <SectionCard
            icon={Building2}
            title="Faculties"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {college.faculties.map(
                (faculty, index) => {
                  const name =
                    typeof faculty === "string"
                      ? faculty
                      : faculty?.name ||
                        faculty?.title ||
                        "Faculty";

                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                        <Building2
                          size={19}
                          className="text-cyan-400"
                        />
                      </div>

                      <h3 className="font-bold text-white">
                        {name}
                      </h3>
                    </div>
                  );
                }
              )}

            </div>
          </SectionCard>
        )}

        {/* =====================================================
            PROGRAMS
        ===================================================== */}

        {Array.isArray(college.programs) && (
          <SectionCard
            icon={GraduationCap}
            title="Programs & Courses"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {college.programs.map(
                (program, index) => {
                  const name =
                    typeof program === "string"
                      ? program
                      : program?.name ||
                        program?.title ||
                        "Program";

                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/5 bg-slate-950/50 p-5"
                    >
                      <div className="flex items-start gap-3">

                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                          <BookOpen
                            size={17}
                            className="text-blue-400"
                          />
                        </div>

                        <div>
                          <h3 className="font-bold text-white">
                            {name}
                          </h3>

                          {typeof program ===
                            "object" &&
                            program?.description && (
                              <p className="mt-2 text-sm leading-6 text-slate-500">
                                {program.description}
                              </p>
                            )}
                        </div>

                      </div>
                    </div>
                  );
                }
              )}

            </div>
          </SectionCard>
        )}

        {/* =====================================================
            ADMISSION INFORMATION
        ===================================================== */}

        {(college.admission_requirements ||
          college.admission_info ||
          college.admission) && (
          <SectionCard
            icon={GraduationCap}
            title="Admission Information"
          >
            <p className="whitespace-pre-line leading-8 text-slate-400">
              {college.admission_requirements ||
                college.admission_info ||
                college.admission}
            </p>
          </SectionCard>
        )}

        {/* =====================================================
            CONTACT
        ===================================================== */}

        <SectionCard
          icon={School}
          title="College Contact"
        >

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {college.email && (
              <ContactItem
                icon={Mail}
                label="Email"
                value={college.email}
              />
            )}

            {college.phone && (
              <ContactItem
                icon={Phone}
                label="Phone"
                value={college.phone}
              />
            )}

            {(college.address ||
              college.location) && (
              <ContactItem
                icon={MapPin}
                label="Address"
                value={
                  college.address ||
                  college.location
                }
              />
            )}

          </div>

        </SectionCard>

        {/* =====================================================
            WEBSITE
        ===================================================== */}

        {college.website && (
          <div className="mb-16 flex justify-center">

            <a
              href={college.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-2xl bg-cyan-500 px-7 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-400"
            >
              <Globe size={20} />
              Visit Official College Website
              <ExternalLink size={17} />
            </a>

          </div>
        )}

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
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">

      <div className="flex items-center gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
          <Icon
            size={20}
            className="text-cyan-400"
          />
        </div>

        <div className="min-w-0">

          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <p className="mt-1 truncate font-bold text-white">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
};

/* =========================================================
   SECTION CARD
========================================================= */

const SectionCard = ({
  icon: Icon,
  title,
  children,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.4,
      }}
      className="mt-8 rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl sm:p-8"
    >

      <div className="mb-6 flex items-center gap-3">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
          <Icon
            size={21}
            className="text-cyan-400"
          />
        </div>

        <h2 className="text-2xl font-black text-white">
          {title}
        </h2>

      </div>

      {children}

    </motion.div>
  );
};

/* =========================================================
   CONTACT ITEM
========================================================= */

const ContactItem = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">

      <div className="flex items-start gap-3">

        <Icon
          size={19}
          className="mt-1 shrink-0 text-cyan-400"
        />

        <div className="min-w-0">

          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p className="mt-2 break-words text-sm font-semibold text-slate-300">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
};

export default CollegeDetails;