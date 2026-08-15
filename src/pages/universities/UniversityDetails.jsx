import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  motion,
} from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Globe2,
  GraduationCap,
  Building2,
  ClipboardCheck,
  Wallet,
  Phone,
  Mail,
  CheckCircle2,
  Loader2,
  BookOpen,
  ExternalLink,
  Landmark,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  Info,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

/* =========================================================
   PREMIUM ANIMATIONS
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },

  visible: {
    opacity: 1,
    y: 0,
  },
};

const fadeScale = {
  hidden: {
    opacity: 0,
    scale: 0.96,
  },

  visible: {
    opacity: 1,
    scale: 1,
  },
};

const staggerContainer = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.065,
    },
  },
};

const heroText = {
  hidden: {
    opacity: 0,
    y: 30,
  },

  visible: {
    opacity: 1,
    y: 0,
  },
};

/* =========================================================
   SECTION CARD
========================================================= */

const SectionCard = ({
  icon: Icon,
  title,
  description,
  children,
  className = "",
  eyebrow,
}) => {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.05,
      }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={[
        "group relative overflow-hidden rounded-[2rem]",
        "border border-white/[0.075]",
        "bg-[#080d19]/95",
        "shadow-[0_30px_100px_rgba(0,0,0,0.25)]",
        "backdrop-blur-2xl",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

      <div className="p-5 sm:p-6 lg:p-7">
        <div className="mb-6 flex items-start gap-4">

          {Icon && (
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.055] shadow-[0_10px_35px_rgba(6,182,212,0.05)]">
              <Icon
                size={19}
                className="relative z-10 text-cyan-400"
              />

              <div className="absolute inset-0 rounded-2xl bg-cyan-400/[0.025] blur-xl" />
            </div>
          )}

          <div className="min-w-0">

            {eyebrow && (
              <p className="mb-1 text-[8px] font-black uppercase tracking-[0.22em] text-cyan-400/55">
                {eyebrow}
              </p>
            )}

            <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">
              {title}
            </h2>

            {description && (
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                {description}
              </p>
            )}

          </div>
        </div>

        {children}
      </div>
    </motion.section>
  );
};

/* =========================================================
   INFO STAT
========================================================= */

const InfoStat = ({
  icon: Icon,
  label,
  value,
  accent = "cyan",
  helper,
}) => {

  const accentClasses = {
    cyan: {
      box: "border-cyan-400/10 bg-cyan-400/[0.055]",
      icon: "text-cyan-400",
      glow: "bg-cyan-400/[0.035]",
    },

    blue: {
      box: "border-blue-400/10 bg-blue-400/[0.055]",
      icon: "text-blue-400",
      glow: "bg-blue-400/[0.035]",
    },

    emerald: {
      box: "border-emerald-400/10 bg-emerald-400/[0.055]",
      icon: "text-emerald-400",
      glow: "bg-emerald-400/[0.035]",
    },

    violet: {
      box: "border-violet-400/10 bg-violet-400/[0.055]",
      icon: "text-violet-400",
      glow: "bg-violet-400/[0.035]",
    },
  };

  const colors =
    accentClasses[accent] ||
    accentClasses.cyan;

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{
        y: -4,
      }}
      transition={{
        duration: 0.25,
      }}
      className="group relative overflow-hidden rounded-[1.5rem] border border-white/[0.065] bg-[#080d19]/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.16)]"
    >

      <div
        className={[
          "absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          colors.glow,
        ].join(" ")}
      />

      <div className="relative">

        <div
          className={[
            "flex h-10 w-10 items-center justify-center rounded-xl border",
            colors.box,
          ].join(" ")}
        >
          {Icon && (
            <Icon
              size={18}
              className={colors.icon}
            />
          )}
        </div>

        <p className="mt-5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-600">
          {label}
        </p>

        <p className="mt-1 truncate text-lg font-black text-white">
          {value}
        </p>

        {helper && (
          <p className="mt-1 truncate text-[10px] font-semibold text-slate-700">
            {helper}
          </p>
        )}

      </div>
    </motion.div>
  );
};

/* =========================================================
   OFFICIAL WEBSITE / FACULTY CTA
========================================================= */

const FacultyWebsiteCTA = ({
  websiteUrl,
  universityName,
}) => {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/[0.09] via-blue-500/[0.035] to-transparent p-6 sm:p-8 lg:p-10">

      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/[0.07] blur-[90px]" />

      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-500/[0.05] blur-[90px]" />

      <div className="relative">

        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          <div className="max-w-2xl">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 shadow-[0_15px_40px_rgba(6,182,212,0.08)]">
              <GraduationCap
                size={27}
                className="text-cyan-400"
              />
            </div>

            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400/70">
              Complete Academic Directory
            </p>

            <h3 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Get all faculties from {universityName}
            </h3>

            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
              Explore the complete list of faculties,
              schools, departments and academic units
              directly from the institution's official
              website.
            </p>

            <p className="mt-3 text-xs leading-6 text-slate-600">
              Academic structures can change over time.
              Always use the institution's official website
              for the latest faculty information.
            </p>

          </div>

          <div className="shrink-0">

            {websiteUrl ? (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black text-slate-950 shadow-[0_15px_45px_rgba(34,211,238,0.15)] transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-300 hover:shadow-[0_20px_55px_rgba(34,211,238,0.22)] sm:w-auto"
              >
                <Globe2
                  size={18}
                />

                Get All Faculties

                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-4 text-center text-sm font-bold text-slate-600">
                Official website unavailable
              </div>
            )}

          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 transition hover:border-cyan-400/10 hover:bg-white/[0.04]">

            <Building2
              size={19}
              className="text-cyan-400"
            />

            <p className="mt-3 text-sm font-black text-white">
              Faculties & Schools
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              Explore the complete academic structure.
            </p>

          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 transition hover:border-cyan-400/10 hover:bg-white/[0.04]">

            <BookOpen
              size={19}
              className="text-cyan-400"
            />

            <p className="mt-3 text-sm font-black text-white">
              Departments
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              Find departments and academic units.
            </p>

          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 transition hover:border-cyan-400/10 hover:bg-white/[0.04]">

            <ShieldCheck
              size={19}
              className="text-cyan-400"
            />

            <p className="mt-3 text-sm font-black text-white">
              Official Source
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              Get the latest structure from the institution.
            </p>

          </div>

        </div>

      </div>
    </div>
  );
};

/* =========================================================
   UNIVERSITY DETAILS
========================================================= */

const UniversityDetails = () => {

  const navigate = useNavigate();
  const { id } = useParams();

  const [
    university,
    setUniversity,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    copied,
    setCopied,
  ] = useState(false);

  /* =======================================================
     LOAD UNIVERSITY
  ======================================================= */

  useEffect(() => {

    if (!id) {
      setError(
        "University ID is missing."
      );

      setLoading(false);

      return;
    }

    loadUniversity();

  }, [id]);

  const loadUniversity =
    async () => {

      try {

        setLoading(true);
        setError("");

        const {
          data: universityData,
          error: universityError,
        } = await supabase
          .from("universities")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (universityError) {
          throw universityError;
        }

        if (!universityData) {

          setUniversity(null);

          setError(
            "The university you're looking for does not exist."
          );

          return;
        }

        setUniversity(
          universityData
        );

      } catch (err) {

        console.error(
          "University Details Error:",
          err
        );

        setUniversity(null);

        setError(
          err?.message ||
          "Unable to load university."
        );

      } finally {

        setLoading(false);

      }
    };

  /* =======================================================
     UNIVERSITY DATA
  ======================================================= */

  const universityName =
    useMemo(
      () =>
        university?.name ||
        "Unnamed University",
      [university]
    );

  const universityDescription =
    useMemo(
      () =>
        university?.description ||
        "Explore this institution and discover important information about its academic identity, location, admissions and official resources.",
      [university]
    );

  const universityAbout =
    useMemo(
      () =>
        university?.about ||
        university?.description ||
        "This institution provides academic opportunities across a range of disciplines.",
      [university]
    );

  const universityLocation =
    useMemo(() => {

      if (
        university?.city &&
        university?.state
      ) {
        return `${university.city}, ${university.state}`;
      }

      return (
        university?.location ||
        university?.state ||
        "Location not specified"
      );

    }, [university]);

  const universityState =
    university?.state ||
    university?.location ||
    "Not specified";

  const universityType =
    university?.type ||
    university?.school_type ||
    university?.institution_type ||
    "University";

  const universityShortName =
    useMemo(() => {

      return (
        university?.short_name ||
        university?.shortName ||
        university?.acronym ||
        university?.code ||
        universityName
          .split(/\s+/)
          .filter(Boolean)
          .map(
            (word) =>
              word[0]
          )
          .join("")
          .slice(0, 6)
          .toUpperCase()
      );

    }, [
      university,
      universityName,
    ]);

  const universityImage =
    university?.cover_url ||
    university?.image_url ||
    university?.image ||
    null;

  const universityLogo =
    university?.logo_url ||
    university?.logo ||
    null;

  const universityWebsite =
    university?.website ||
    university?.website_url ||
    university?.official_website ||
    "";

  const universityPhone =
    university?.phone ||
    university?.phone_number ||
    university?.contact_phone ||
    "";

  const universityEmail =
    university?.email ||
    university?.contact_email ||
    "";

  const universityAddress =
    university?.address ||
    university?.contact_address ||
    universityLocation;

  /* =======================================================
     WEBSITE
  ======================================================= */

  const websiteUrl =
    useMemo(() => {

      if (!universityWebsite) {
        return "";
      }

      const website =
        String(
          universityWebsite
        ).trim();

      if (!website) {
        return "";
      }

      return website.startsWith(
        "http://"
      ) ||
        website.startsWith(
          "https://"
        )
        ? website
        : `https://${website}`;

    }, [universityWebsite]);

  /* =======================================================
     COPY EMAIL
  ======================================================= */

  const handleCopyEmail =
    async () => {

      if (!universityEmail) {
        return;
      }

      try {

        await navigator.clipboard.writeText(
          universityEmail
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 1800);

      } catch (err) {

        console.error(
          "Unable to copy email:",
          err
        );

      }
    };

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (
    !loading &&
    !university
  ) {

    return (
      <div className="relative min-h-screen overflow-hidden bg-[#03050a] px-4 py-10 text-white">

        <div className="pointer-events-none absolute inset-0">

          <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-red-500/[0.025] blur-[140px]" />

          <div
            className="absolute inset-0 opacity-[0.018]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize:
                "32px 32px",
            }}
          />

        </div>

        <div className="relative mx-auto max-w-5xl">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/universities"
              )
            }
            className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-slate-400 transition-all hover:border-cyan-400/20 hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />

            Back to Universities
          </button>

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="relative mt-8 overflow-hidden rounded-[2.25rem] border border-white/[0.08] bg-[#0a1020] px-6 py-20 text-center shadow-[0_35px_120px_rgba(0,0,0,0.4)]"
          >

            <div className="absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-red-400/[0.025] blur-3xl" />

            <div className="relative">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-red-400/10 bg-red-400/[0.07]">

                <Building2
                  size={34}
                  className="text-red-400"
                />

              </div>

              <p className="mt-7 text-[9px] font-black uppercase tracking-[0.22em] text-red-400/60">
                Institution unavailable
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                University not found
              </h1>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">
                {error ||
                  "The university you're looking for does not exist or is no longer available."}
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/universities"
                  )
                }
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-black text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-cyan-400"
              >
                <ArrowLeft
                  size={17}
                />

                Browse Universities
              </button>

            </div>

          </motion.div>

        </div>

      </div>
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (
      <div className="relative min-h-screen overflow-hidden bg-[#03050a] px-4 py-10 text-white">

        <div className="pointer-events-none absolute inset-0">

          <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.025] blur-[150px]" />

          <div className="absolute right-[-12%] top-[20%] h-[550px] w-[550px] rounded-full bg-blue-600/[0.025] blur-[150px]" />

          <div
            className="absolute inset-0 opacity-[0.018]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize:
                "32px 32px",
            }}
          />

        </div>

        <div className="relative mx-auto max-w-7xl">

          <div className="mb-6 h-10 w-36 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.025]" />

          <div className="h-[500px] animate-pulse rounded-[2.25rem] border border-white/[0.06] bg-white/[0.025] sm:h-[560px]" />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {Array.from({
              length: 4,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.025]"
                />
              )
            )}

          </div>

          <div className="flex flex-col items-center justify-center py-16">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.05]">

              <Loader2
                size={28}
                className="animate-spin text-cyan-400"
              />

            </div>

            <p className="mt-4 text-sm font-bold text-slate-600">
              Loading university profile...
            </p>

          </div>

        </div>

      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03050a] text-white">

      {/* =====================================================
          PREMIUM BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute left-[-10%] top-[-10%] h-[550px] w-[550px] rounded-full bg-cyan-500/[0.025] blur-[150px]" />

        <div className="absolute right-[-12%] top-[18%] h-[600px] w-[600px] rounded-full bg-blue-600/[0.025] blur-[160px]" />

        <div className="absolute bottom-[-15%] left-[28%] h-[550px] w-[550px] rounded-full bg-violet-500/[0.018] blur-[160px]" />

        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize:
              "32px 32px",
          }}
        />

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent" />

      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">

        {/* ===================================================
            BACK
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            x: -10,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="mb-6"
        >

          <button
            type="button"
            onClick={() =>
              navigate(
                "/universities"
              )
            }
            className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-sm font-bold text-slate-500 backdrop-blur-xl transition-all hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
          >

            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />

            Universities

          </button>

        </motion.div>

        {/* ===================================================
            HERO
        =================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 22,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative mb-7 overflow-hidden rounded-[2.25rem] border border-white/[0.09] bg-[#080d19] shadow-[0_35px_120px_rgba(0,0,0,0.4)]"
        >

          <div className="relative h-[520px] sm:h-[580px] lg:h-[620px]">

            {universityImage ? (
              <img
                src={universityImage}
                alt={universityName}
                className="h-full w-full object-cover transition-transform duration-[2s]"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#101a31] via-[#080d19] to-[#03050a]" />
            )}

            {/* IMAGE OVERLAYS */}

            <div className="absolute inset-0 bg-gradient-to-t from-[#040711] via-[#040711]/65 to-[#040711]/10" />

            <div className="absolute inset-0 bg-gradient-to-r from-[#040711]/85 via-[#040711]/25 to-transparent" />

            <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/40 to-transparent" />

            {/* PREMIUM GRID */}

            <div
              className="absolute inset-0 opacity-[0.045]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize:
                  "70px 70px",
                maskImage:
                  "linear-gradient(to bottom, black, transparent 75%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black, transparent 75%)",
              }}
            />

            {/* LOGO */}

            <motion.div
              variants={fadeScale}
              initial="hidden"
              animate="visible"
              transition={{
                delay: 0.15,
                duration: 0.5,
              }}
              className="absolute left-5 top-5 sm:left-8 sm:top-8"
            >

              <div className="relative">

                <div className="absolute inset-0 rounded-[1.5rem] bg-cyan-400/[0.08] blur-2xl" />

                <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/15 bg-slate-950/80 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:h-24 sm:w-24">

                  {universityLogo ? (
                    <img
                      src={universityLogo}
                      alt={`${universityName} logo`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Building2
                      size={36}
                      className="text-slate-600"
                    />
                  )}

                </div>

              </div>

            </motion.div>

            {/* TYPE */}

            <motion.div
              initial={{
                opacity: 0,
                x: 10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="absolute right-5 top-5 sm:right-8 sm:top-8"
            >

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/65 px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.17em] text-cyan-300 backdrop-blur-xl">

                <Sparkles
                  size={12}
                />

                {universityType}

              </div>

            </motion.div>

            {/* HERO CONTENT */}

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9 lg:p-11">

              <motion.div
                variants={heroText}
                initial="hidden"
                animate="visible"
                transition={{
                  delay: 0.18,
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="max-w-5xl"
              >

                <div className="mb-4 flex flex-wrap items-center gap-2.5">

                  <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-cyan-300">
                    {universityShortName}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/10 bg-emerald-400/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-emerald-400">

                    <CheckCircle2
                      size={11}
                    />

                    Institution Listed

                  </span>

                </div>

                <h1 className="max-w-5xl text-4xl font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl lg:text-7xl">
                  {universityName}
                </h1>

                <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                  {universityDescription}
                </p>

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-300">

                  <span className="inline-flex items-center gap-2">

                    <MapPin
                      size={16}
                      className="text-cyan-400"
                    />

                    {universityLocation}

                  </span>

                  <span className="inline-flex items-center gap-2">

                    <Landmark
                      size={16}
                      className="text-cyan-400"
                    />

                    {universityState}

                  </span>

                </div>

              </motion.div>

            </div>

          </div>

          {/* ACTION BAR */}

          <div className="flex flex-col gap-3 border-t border-white/[0.07] bg-[#050914]/95 p-5 backdrop-blur-xl sm:flex-row sm:flex-wrap sm:p-6">

            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3.5 text-sm font-black text-slate-950 shadow-[0_10px_35px_rgba(6,182,212,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-400 hover:shadow-[0_15px_45px_rgba(6,182,212,0.18)]"
              >

                <Globe2
                  size={17}
                />

                Official Website

                <ExternalLink
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />

              </a>
            )}

            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.035] px-5 py-3.5 text-sm font-black text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-white/[0.06]"
              >

                Get All Faculties

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />

              </a>
            )}

          </div>

        </motion.section>

        {/* ===================================================
            QUICK STATS
        =================================================== */}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >

          <InfoStat
            icon={GraduationCap}
            label="Institution"
            value={universityShortName}
            helper={universityType}
            accent="cyan"
          />

          <InfoStat
            icon={MapPin}
            label="Location"
            value={universityState}
            helper={universityLocation}
            accent="blue"
          />

          <InfoStat
            icon={Landmark}
            label="Institution Type"
            value={universityType}
            helper="Higher Education"
            accent="emerald"
          />

          <InfoStat
            icon={Globe2}
            label="Official Source"
            value={websiteUrl ? "Available" : "Unavailable"}
            helper={
              websiteUrl
                ? "Institution website"
                : "Website not provided"
            }
            accent="violet"
          />

        </motion.div>

        {/* ===================================================
            MAIN GRID
        =================================================== */}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]"
        >

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="min-w-0 space-y-7">

            {/* ABOUT */}

            <SectionCard
              icon={Building2}
              eyebrow="Institution profile"
              title="About the University"
              description="An overview of the institution and its academic identity."
            >

              <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#060b15] p-5 shadow-inner sm:p-6">

                <div className="absolute left-0 top-6 h-12 w-1 rounded-r-full bg-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.2)]" />

                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400/[0.02] blur-3xl" />

                <p className="relative whitespace-pre-line pl-4 text-sm leading-8 text-slate-400 sm:text-[15px]">
                  {universityAbout}
                </p>

              </div>

            </SectionCard>

            {/* =================================================
                ALL FACULTIES
            ================================================= */}

            <SectionCard
              icon={GraduationCap}
              eyebrow="Academic structure"
              title="Explore All Faculties"
              description="Access the complete academic structure directly from the university."
            >

              <FacultyWebsiteCTA
                websiteUrl={websiteUrl}
                universityName={universityName}
              />

            </SectionCard>

          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="min-w-0 space-y-7 lg:sticky lg:top-6 lg:self-start">

            {/* ADMISSION */}

            <SectionCard
              icon={ClipboardCheck}
              eyebrow="Application"
              title="Admission"
              description="Important information before applying."
            >

              {university?.admission ? (
                <p className="whitespace-pre-line text-sm leading-7 text-slate-400">
                  {university.admission}
                </p>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/[0.07] bg-[#060b15] p-5">

                  <Info
                    size={18}
                    className="text-slate-700"
                  />

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Admission information for this institution has not been added yet.
                  </p>

                </div>
              )}

              <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.045] p-4">

                <div className="flex items-start gap-3">

                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-cyan-400"
                  />

                  <p className="text-xs leading-6 text-cyan-300/80">
                    Always verify current admission requirements directly with the institution before applying.
                  </p>

                </div>

              </div>

            </SectionCard>

            {/* FEES */}

            <SectionCard
              icon={Wallet}
              eyebrow="Financial information"
              title="Fees"
              description="Tuition and related financial information."
            >

              {university?.fees ? (
                <p className="whitespace-pre-line text-sm leading-7 text-slate-400">
                  {university.fees}
                </p>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/[0.07] bg-[#060b15] p-5">

                  <Info
                    size={18}
                    className="text-slate-700"
                  />

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Fee information for this institution has not been added yet.
                  </p>

                </div>
              )}

              <div className="mt-5 rounded-2xl border border-amber-400/10 bg-amber-400/[0.035] p-4">

                <div className="flex items-start gap-3">

                  <Wallet
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-400"
                  />

                  <p className="text-xs leading-6 text-amber-300/70">
                    Fees may change between academic sessions. Confirm current charges before making any payment.
                  </p>

                </div>

              </div>

            </SectionCard>

            {/* CONTACT */}

            <SectionCard
              icon={Phone}
              eyebrow="Get in touch"
              title="Contact"
              description="Available institutional contact details."
            >

              <div className="space-y-4">

                {/* ADDRESS */}

                <div className="rounded-2xl border border-white/[0.06] bg-[#060b15] p-4">

                  <div className="flex gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.07]">

                      <MapPin
                        size={17}
                        className="text-cyan-400"
                      />

                    </div>

                    <div className="min-w-0">

                      <p className="text-[9px] font-black uppercase tracking-[0.17em] text-slate-700">
                        Address
                      </p>

                      <p className="mt-1.5 text-sm leading-6 text-slate-400">
                        {universityAddress}
                      </p>

                    </div>

                  </div>

                </div>

                {/* PHONE */}

                {universityPhone && (
                  <a
                    href={`tel:${universityPhone}`}
                    className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#060b15] p-4 transition-all hover:border-cyan-400/15 hover:bg-white/[0.025]"
                  >

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.07]">

                      <Phone
                        size={17}
                        className="text-cyan-400"
                      />

                    </div>

                    <div className="min-w-0">

                      <p className="text-[9px] font-black uppercase tracking-[0.17em] text-slate-700">
                        Phone
                      </p>

                      <p className="mt-1.5 truncate text-sm font-semibold text-slate-400 group-hover:text-white">
                        {universityPhone}
                      </p>

                    </div>

                  </a>
                )}

                {/* EMAIL */}

                {universityEmail && (
                  <div className="rounded-2xl border border-white/[0.06] bg-[#060b15] p-4">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.07]">

                        <Mail
                          size={17}
                          className="text-cyan-400"
                        />

                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-center justify-between gap-3">

                          <p className="text-[9px] font-black uppercase tracking-[0.17em] text-slate-700">
                            Email
                          </p>

                          <button
                            type="button"
                            onClick={handleCopyEmail}
                            aria-label="Copy university email"
                            className="rounded-lg p-1.5 text-slate-600 transition hover:bg-white/[0.05] hover:text-cyan-400"
                          >

                            {copied ? (
                              <Check
                                size={14}
                              />
                            ) : (
                              <Copy
                                size={14}
                              />
                            )}

                          </button>

                        </div>

                        <a
                          href={`mailto:${universityEmail}`}
                          className="mt-1.5 block break-all text-sm font-semibold text-slate-400 transition-colors hover:text-cyan-400"
                        >
                          {universityEmail}
                        </a>

                      </div>

                    </div>

                  </div>
                )}

                {!universityPhone &&
                  !universityEmail && (
                    <div className="rounded-2xl border border-dashed border-white/[0.07] bg-[#060b15] p-6 text-center">

                      <Phone
                        size={23}
                        className="mx-auto text-slate-700"
                      />

                      <p className="mt-3 text-sm text-slate-600">
                        Contact information has not been added yet.
                      </p>

                    </div>
                  )}

              </div>

            </SectionCard>

            {/* OFFICIAL WEBSITE */}

            {websiteUrl && (
              <motion.a
                variants={fadeUp}
                whileHover={{
                  y: -4,
                }}
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden rounded-[2rem] border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.07] to-blue-500/[0.025] p-6 transition-all duration-300 hover:border-cyan-400/20 hover:shadow-[0_25px_70px_rgba(6,182,212,0.07)]"
              >

                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/[0.05] blur-3xl" />

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.07]">

                      <Globe2
                        size={20}
                        className="text-cyan-400"
                      />

                    </div>

                    <ExternalLink
                      size={17}
                      className="text-slate-700 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-400"
                    />

                  </div>

                  <p className="mt-5 text-[10px] font-black uppercase tracking-[0.17em] text-cyan-400/70">
                    Official Institution
                  </p>

                  <h3 className="mt-1 font-black text-white">
                    Visit official website
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-slate-600">
                    Get the latest information directly from the institution.
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-xs font-black text-cyan-400">

                    Open website

                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />

                  </div>

                </div>

              </motion.a>
            )}

          </aside>

        </motion.div>

        {/* ===================================================
            PREMIUM FACULTY CTA
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
            amount: 0.1,
          }}
          className="mt-8"
        >

          <SectionCard
            icon={GraduationCap}
            eyebrow="Academic directory"
            title="Find Every Faculty"
            description="Get the institution's complete and current academic structure."
          >

            <FacultyWebsiteCTA
              websiteUrl={websiteUrl}
              universityName={universityName}
            />

          </SectionCard>

        </motion.div>

        {/* ===================================================
            TRUST
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
            amount: 0.1,
          }}
          className="mt-8 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 sm:p-6"
        >

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.06]">

              <ShieldCheck
                size={19}
                className="text-cyan-400"
              />

            </div>

            <div className="flex-1">

              <p className="text-sm font-black text-white">
                University information
              </p>

              <p className="mt-1 text-xs leading-6 text-slate-600">
                Information displayed on this profile is loaded from the institution records available in the platform. Confirm important admission, fee, faculty and application details with the institution.
              </p>

            </div>

            <div className="hidden shrink-0 items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.045] px-3 py-2 sm:inline-flex">

              <CheckCircle2
                size={13}
                className="text-emerald-400"
              />

              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                Platform Listed
              </span>

            </div>

          </div>

        </motion.div>

        {/* ===================================================
            BOTTOM NAVIGATION
        =================================================== */}

        <div className="flex justify-center py-12">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/universities"
              )
            }
            className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-6 py-3.5 text-sm font-black text-slate-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
          >

            <ArrowLeft
              size={17}
              className="transition-transform group-hover:-translate-x-1"
            />

            Back to All Universities

          </button>

        </div>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="border-t border-white/[0.06] py-8 text-center">

          <p className="text-xs font-semibold text-slate-700">
            University information powered by Scholiqen.
          </p>

        </footer>

      </div>

    </div>
  );
};

export default UniversityDetails;