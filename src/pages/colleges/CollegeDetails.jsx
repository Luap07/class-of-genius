import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  School,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Layers3,
  Compass,
  Landmark,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

const CollegeDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  /* =========================================================
     FETCH COLLEGE
  ========================================================= */

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

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
     COPY
  ========================================================= */

  const handleCopy = async (value, type) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);

      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch (error) {
      console.error("Copy Error:", error);
    }
  };

  /* =========================================================
     WEBSITE
  ========================================================= */

  const websiteUrl = useMemo(() => {
    if (!college?.website) return "";

    const website = college.website.trim();

    if (!website) return "";

    if (
      website.startsWith("http://") ||
      website.startsWith("https://")
    ) {
      return website;
    }

    return `https://${website}`;
  }, [college?.website]);

  /* =========================================================
     LOCATION
  ========================================================= */

  const locationText = useMemo(() => {
    return [
      college?.location,
      college?.state,
      college?.country,
    ]
      .filter(Boolean)
      .join(", ");
  }, [
    college?.location,
    college?.state,
    college?.country,
  ]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <section className="min-h-screen overflow-hidden bg-[#020617] px-4 py-8 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl animate-pulse">

          <div className="h-11 w-36 rounded-2xl bg-white/5" />

          <div className="mt-6 overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.025]">
            <div className="h-[430px] bg-white/5 sm:h-[560px]" />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 rounded-3xl bg-white/5"
              />
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="h-80 rounded-[2rem] bg-white/5" />
            <div className="h-80 rounded-[2rem] bg-white/5" />
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
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-6 text-white">

        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/[0.06] blur-[140px]" />

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative z-10 max-w-md text-center"
        >
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.03]">
            <School
              size={42}
              className="text-slate-600"
            />
          </div>

          <h1 className="mt-7 text-3xl font-black">
            College Not Found
          </h1>

          <p className="mt-3 leading-7 text-slate-500">
            The college you're looking for could not
            be found or may no longer be available.
          </p>

          <button
            type="button"
            onClick={() => navigate("/colleges")}
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
          >
            <ArrowLeft size={17} />
            Back to Colleges
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-6 text-white sm:px-6 lg:px-10 lg:py-8">

      {/* =====================================================
          PREMIUM BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute left-[5%] top-[-5%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.055] blur-[160px]" />

        <div className="absolute right-[-5%] top-[25%] h-[460px] w-[460px] rounded-full bg-blue-500/[0.045] blur-[160px]" />

        <div className="absolute bottom-[-10%] left-[30%] h-[420px] w-[420px] rounded-full bg-cyan-400/[0.025] blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

      </div>

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* ===================================================
            TOP NAV
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: -12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-6 flex items-center justify-between"
        >
          <button
            type="button"
            onClick={() => navigate("/colleges")}
            className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-bold text-slate-300 backdrop-blur-xl transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-white"
          >
            <ArrowLeft
              size={17}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />

            Back to Colleges
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 sm:flex">
            <ShieldCheck
              size={14}
              className="text-cyan-400"
            />

            College Profile
          </div>
        </motion.div>

        {/* ===================================================
            HERO
        =================================================== */}

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
            duration: 0.55,
          }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900 shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
        >

          <div className="relative h-[450px] sm:h-[560px]">

            {/* IMAGE */}

            {college.image_url ? (
              <img
                src={college.image_url}
                alt={college.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950">
                <School
                  size={170}
                  strokeWidth={1}
                  className="text-cyan-400/10"
                />
              </div>
            )}

            {/* IMAGE OVERLAYS */}

            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/55 to-transparent" />

            <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/80 via-[#020617]/20 to-transparent" />

            {/* LOGO */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.85,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                delay: 0.2,
              }}
              className="absolute left-6 top-6 sm:left-10 sm:top-10"
            >
              <div className="relative">

                <div className="absolute -inset-4 rounded-[2rem] bg-cyan-400/10 blur-2xl" />

                <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/30 bg-white p-3 shadow-2xl sm:h-36 sm:w-36">

                  {college.logo_url ? (
                    <img
                      src={college.logo_url}
                      alt={`${college.name} logo`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Building2
                      size={52}
                      strokeWidth={1.5}
                      className="text-slate-400"
                    />
                  )}

                </div>

                <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-cyan-400/20 bg-slate-950/95 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-cyan-400 shadow-xl backdrop-blur-xl">
                  <CheckCircle2 size={11} />
                  Institution
                </div>

              </div>
            </motion.div>

            {/* HERO CONTENT */}

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-12">

              <div className="max-w-5xl">

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-cyan-300 backdrop-blur-xl">
                  <Sparkles size={13} />
                  College
                </div>

                <h1 className="max-w-5xl text-4xl font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl lg:text-7xl">
                  {college.name}
                </h1>

                {locationText && (
                  <div className="mt-5 flex items-center gap-3 text-sm font-medium text-slate-300 sm:text-base">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/10">
                      <MapPin
                        size={17}
                        className="text-cyan-400"
                      />
                    </div>

                    {locationText}

                  </div>
                )}

              </div>

            </div>
          </div>
        </motion.div>

        {/* ===================================================
            QUICK INFO
        =================================================== */}

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <InfoCard
            icon={School}
            title="Institution"
            value="College"
          />

          <InfoCard
            icon={MapPin}
            title="Location"
            value={
              college.state ||
              college.location ||
              "Not provided"
            }
          />

          <InfoCard
            icon={Globe}
            title="Country"
            value={
              college.country ||
              "Nigeria"
            }
          />

          <InfoCard
            icon={Landmark}
            title="Institution Type"
            value="Higher Education"
          />

        </div>

        {/* ===================================================
            WHERE TO FIND US
        =================================================== */}

        {locationText && (
          <SectionCard
            icon={MapPin}
            eyebrow="Where to find us"
            title="Campus Location"
          >
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-cyan-400/[0.08] via-white/[0.025] to-transparent p-6 sm:p-8">

              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/[0.06] blur-3xl" />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10">
                  <MapPin
                    size={28}
                    className="text-cyan-400"
                  />
                </div>

                <div className="min-w-0">

                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/70">
                    Campus Location
                  </p>

                  <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">
                    {locationText}
                  </h3>

                  {college.address && (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {college.address}
                    </p>
                  )}

                </div>

              </div>
            </div>
          </SectionCard>
        )}

        {/* ===================================================
            ABOUT
        =================================================== */}

        {college.description && (
          <SectionCard
            icon={BookOpen}
            eyebrow="Institution Overview"
            title="About the College"
          >
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/5 bg-white/[0.02] p-6 sm:p-8">

              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400/[0.025] blur-3xl" />

              <p className="relative whitespace-pre-line text-[15px] leading-8 text-slate-400 sm:text-base">
                {college.description}
              </p>

            </div>
          </SectionCard>
        )}

        {/* ===================================================
            ACADEMIC FACULTIES
            PREMIUM WEBSITE CTA
        =================================================== */}

        <SectionCard
          icon={Building2}
          eyebrow="Academic Structure"
          title="Explore Academic Faculties"
        >

          <div className="relative overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/[0.10] via-blue-500/[0.04] to-transparent p-7 sm:p-10">

            {/* DECORATION */}

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/[0.07] blur-[80px]" />

            <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-blue-500/[0.05] blur-[80px]" />

            <div className="relative">

              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

                <div className="max-w-2xl">

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10">
                    <GraduationCap
                      size={27}
                      className="text-cyan-400"
                    />
                  </div>

                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400/70">
                    Complete Academic Directory
                  </p>

                  <h3 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Get all faculties from the institution
                  </h3>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                    Explore the complete list of faculties,
                    schools, departments, and academic units
                    directly from the institution's official
                    website. This ensures you always have access
                    to the most complete and up-to-date academic
                    information.
                  </p>

                </div>

                <div className="shrink-0">

                  {websiteUrl ? (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black text-slate-950 shadow-[0_15px_45px_rgba(34,211,238,0.15)] transition duration-300 hover:-translate-y-1 hover:bg-cyan-300 sm:w-auto"
                    >
                      <Globe size={18} />

                      Get All Faculties

                      <ArrowUpRight
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </a>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-4 text-center text-sm font-bold text-slate-500">
                      Official website unavailable
                    </div>
                  )}

                </div>

              </div>

              {/* BENEFITS */}

              <div className="mt-8 grid gap-3 sm:grid-cols-3">

                <FacultyBenefit
                  icon={Building2}
                  title="Faculties"
                  text="View the institution's complete faculty structure."
                />

                <FacultyBenefit
                  icon={Layers3}
                  title="Departments"
                  text="Discover departments and academic units."
                />

                <FacultyBenefit
                  icon={ShieldCheck}
                  title="Official Source"
                  text="Get information directly from the institution."
                />

              </div>

            </div>
          </div>
        </SectionCard>

        {/* ===================================================
            CONTACT + WEBSITE
        =================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">

          <SectionCard
            icon={Building2}
            eyebrow="Get in touch"
            title="College Contact"
          >

            <div className="grid gap-3 sm:grid-cols-2">

              {college.email && (
                <ContactItem
                  icon={Mail}
                  label="Email"
                  value={college.email}
                  onCopy={() =>
                    handleCopy(
                      college.email,
                      "email"
                    )
                  }
                  copied={copied === "email"}
                />
              )}

              {college.phone && (
                <ContactItem
                  icon={Phone}
                  label="Phone"
                  value={college.phone}
                  onCopy={() =>
                    handleCopy(
                      college.phone,
                      "phone"
                    )
                  }
                  copied={copied === "phone"}
                />
              )}

              {college.address && (
                <ContactItem
                  icon={MapPin}
                  label="Address"
                  value={college.address}
                  onCopy={() =>
                    handleCopy(
                      college.address,
                      "address"
                    )
                  }
                  copied={copied === "address"}
                />
              )}

            </div>

          </SectionCard>

          {/* OFFICIAL WEBSITE */}

          {websiteUrl && (
            <motion.div
              whileHover={{
                y: -4,
              }}
              className="relative overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/[0.10] via-slate-900 to-slate-950 p-6 shadow-xl"
            >

              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="relative">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10">
                  <Globe
                    size={21}
                    className="text-cyan-400"
                  />
                </div>

                <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
                  Official Website
                </p>

                <p className="mt-2 break-all text-sm font-semibold text-slate-400">
                  {college.website}
                </p>

                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
                >
                  Visit Official Website

                  <ExternalLink
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>

              </div>
            </motion.div>
          )}

        </div>

        {/* ===================================================
            FINAL CTA
        =================================================== */}

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
          className="relative mb-12 mt-8 overflow-hidden rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-7 text-center sm:p-10"
        >

          <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-cyan-400/[0.06] blur-3xl" />

          <div className="relative">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10">
              <Compass
                size={26}
                className="text-cyan-400"
              />
            </div>

            <h3 className="mt-5 text-2xl font-black text-white sm:text-3xl">
              Continue Exploring
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
              Discover more colleges and explore
              opportunities across institutions.
            </p>

            <button
              type="button"
              onClick={() => navigate("/colleges")}
              className="group mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-slate-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.06] hover:text-white"
            >
              <ArrowLeft
                size={17}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />

              Explore More Colleges
            </button>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

/* =========================================================
   FACULTY BENEFIT
========================================================= */

const FacultyBenefit = ({
  icon: Icon,
  title,
  text,
}) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.025] p-4 transition hover:border-cyan-400/10 hover:bg-white/[0.04]">

      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.07]">
          <Icon
            size={17}
            className="text-cyan-400"
          />
        </div>

        <div>
          <p className="text-sm font-black text-white">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {text}
          </p>
        </div>

      </div>
    </div>
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
    <motion.div
      whileHover={{
        y: -3,
      }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl"
    >

      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400/[0.035] blur-2xl transition group-hover:bg-cyan-400/[0.08]" />

      <div className="relative flex items-center gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.08]">
          <Icon
            size={20}
            className="text-cyan-400"
          />
        </div>

        <div className="min-w-0">

          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600">
            {title}
          </p>

          <p className="mt-1 truncate text-sm font-bold text-white">
            {value}
          </p>

        </div>

      </div>
    </motion.div>
  );
};

/* =========================================================
   SECTION CARD
========================================================= */

const SectionCard = ({
  icon: Icon,
  eyebrow,
  title,
  children,
  compact = false,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.12,
      }}
      transition={{
        duration: 0.45,
      }}
      className={`mt-6 rounded-[2rem] border border-white/10 bg-white/[0.025] backdrop-blur-2xl ${
        compact
          ? "p-5"
          : "p-6 sm:p-8"
      }`}
    >

      <div className="mb-6 flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.08]">
          <Icon
            size={20}
            className="text-cyan-400"
          />
        </div>

        <div className="min-w-0">

          {eyebrow && (
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400/70">
              {eyebrow}
            </p>
          )}

          <h2 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">
            {title}
          </h2>

        </div>

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
  onCopy,
  copied,
}) => {
  return (
    <div className="group rounded-2xl border border-white/5 bg-white/[0.025] p-4 transition hover:border-cyan-400/15 hover:bg-cyan-400/[0.025]">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08]">
          <Icon
            size={17}
            className="text-cyan-400"
          />
        </div>

        <div className="min-w-0 flex-1">

          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-600">
            {label}
          </p>

          <p className="mt-1 break-all text-sm font-semibold text-slate-300">
            {value}
          </p>

        </div>

        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] text-slate-500 transition hover:bg-white/10 hover:text-white"
            title={`Copy ${label}`}
          >
            {copied ? (
              <Check
                size={15}
                className="text-emerald-400"
              />
            ) : (
              <Copy size={15} />
            )}
          </button>
        )}

      </div>
    </div>
  );
};

export default CollegeDetails;
