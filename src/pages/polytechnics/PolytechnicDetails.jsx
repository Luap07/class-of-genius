import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  School,
  Sparkles,
  BookOpen,
  Award,
  CalendarDays,
  ShieldCheck,
  Phone,
  Layers3,
  LibraryBig,
  ListTree,
  BookMarked,
  Info,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

const PolytechnicDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [polytechnic, setPolytechnic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  /* =========================================================
     FETCH POLYTECHNIC
  ========================================================= */

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetchPolytechnic();
  }, [id]);

  const fetchPolytechnic = async () => {
    try {
      setLoading(true);

      const {
        data: polytechnicData,
        error: polytechnicError,
      } = await supabase
        .from("polytechnics")
        .select("*")
        .eq("id", id)
        .single();

      if (polytechnicError) {
        console.error(
          "Polytechnic Details Error:",
          polytechnicError
        );

        setPolytechnic(null);
        return;
      }

      setPolytechnic(polytechnicData);
    } catch (error) {
      console.error(
        "Polytechnic Details Error:",
        error
      );

      setPolytechnic(null);
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
      await navigator.clipboard.writeText(String(value));

      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch (error) {
      console.error("Copy Error:", error);
    }
  };

  /* =========================================================
     WEBSITE URL
  ========================================================= */

  const websiteUrl = polytechnic?.website
    ? polytechnic.website.startsWith("http://") ||
      polytechnic.website.startsWith("https://")
      ? polytechnic.website
      : `https://${polytechnic.website}`
    : "";

  /* =========================================================
     LOCATION
  ========================================================= */

  const locationText = [
    polytechnic?.address,
    polytechnic?.city,
    polytechnic?.state,
    polytechnic?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const shortLocation = [
    polytechnic?.city,
    polytechnic?.state,
  ]
    .filter(Boolean)
    .join(", ");

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-[8%] top-0 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.055] blur-[150px]" />

          <div className="absolute right-[3%] top-[35%] h-[380px] w-[380px] rounded-full bg-blue-500/[0.045] blur-[140px]" />

          <div className="absolute inset-0 opacity-[0.022]">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="h-11 w-40 animate-pulse rounded-2xl bg-white/5" />

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.025]">
            <div className="h-[430px] animate-pulse bg-white/5 sm:h-[520px]" />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-3xl bg-white/5"
              />
            ))}
          </div>

          <div className="mt-6 grid gap-6">
            <div className="h-56 animate-pulse rounded-[2rem] bg-white/5" />

            <div className="h-96 animate-pulse rounded-[2rem] bg-white/5" />
          </div>
        </div>
      </section>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!polytechnic) {
    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-6 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[10%] top-[10%] h-72 w-72 rounded-full bg-cyan-500/[0.06] blur-[120px]" />

          <div className="absolute bottom-[10%] right-[10%] h-72 w-72 rounded-full bg-blue-500/[0.05] blur-[120px]" />

          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

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
            Polytechnic Not Found
          </h1>

          <p className="mt-3 leading-7 text-slate-500">
            The polytechnic you're looking for could
            not be found or may no longer be
            available.
          </p>

          <button
            type="button"
            onClick={() => navigate("/polytechnics")}
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
          >
            <ArrowLeft size={17} />
            Back to Polytechnics
          </button>
        </motion.div>
      </section>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-0 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.055] blur-[150px]" />

        <div className="absolute right-[3%] top-[35%] h-[380px] w-[380px] rounded-full bg-blue-500/[0.045] blur-[140px]" />

        <div className="absolute bottom-0 left-[35%] h-[320px] w-[320px] rounded-full bg-cyan-400/[0.025] blur-[130px]" />

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
            onClick={() => navigate("/polytechnics")}
            className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-bold text-slate-300 backdrop-blur-xl transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-white"
          >
            <ArrowLeft
              size={17}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />

            Back to Polytechnics
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 sm:flex">
            <ShieldCheck size={13} />
            Polytechnic Profile
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
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.35)]"
        >
          <div className="relative h-[430px] sm:h-[520px]">
            {polytechnic.cover_url ||
            polytechnic.image_url ? (
              <img
                src={
                  polytechnic.cover_url ||
                  polytechnic.image_url
                }
                alt={
                  polytechnic.name ||
                  "Polytechnic"
                }
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950">
                <School
                  size={150}
                  strokeWidth={1}
                  className="text-cyan-400/10"
                />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent" />

            <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/70 via-transparent to-transparent" />

            {/* =================================================
                LOGO
            ================================================= */}

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
                <div className="absolute -inset-3 rounded-[2rem] bg-cyan-400/10 blur-2xl" />

                <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/30 bg-white p-3 shadow-2xl sm:h-36 sm:w-36">
                  {polytechnic.logo_url ? (
                    <img
                      src={polytechnic.logo_url}
                      alt={`${polytechnic.name || "Polytechnic"} logo`}
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

            {/* =================================================
                HERO CONTENT
            ================================================= */}

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-12">
              <div className="max-w-5xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-cyan-300 backdrop-blur-xl">
                  <Sparkles size={13} />
                  Polytechnic
                </div>

                <h1 className="max-w-5xl text-4xl font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                  {polytechnic.name || "Polytechnic"}
                </h1>

                {polytechnic.short_name && (
                  <p className="mt-3 text-sm font-black uppercase tracking-[0.18em] text-cyan-400">
                    {polytechnic.short_name}
                  </p>
                )}

                {shortLocation && (
                  <div className="mt-5 flex items-center gap-3 text-sm font-medium text-slate-300 sm:text-base">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/10">
                      <MapPin
                        size={17}
                        className="text-cyan-400"
                      />
                    </div>

                    {shortLocation}
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
            title="Institution Type"
            value={
              polytechnic.type ||
              "Polytechnic"
            }
          />

          <InfoCard
            icon={MapPin}
            title="Location"
            value={
              shortLocation ||
              polytechnic.country ||
              "Not provided"
            }
          />

          <InfoCard
            icon={Globe}
            title="Academic Directory"
            value={
              websiteUrl
                ? "Official Website"
                : "Not provided"
            }
          />

          <InfoCard
            icon={GraduationCap}
            title="Institution Status"
            value={
              polytechnic.active
                ? "Active"
                : "Inactive"
            }
          />
        </div>

        {/* ===================================================
            LOCATION
        =================================================== */}

        {locationText && (
          <SectionCard
            icon={MapPin}
            eyebrow="Where to find us"
            title="Where to Find Us"
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

                  {polytechnic.address && (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {polytechnic.address}
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

        {polytechnic.description && (
          <SectionCard
            icon={BookOpen}
            eyebrow="Institution Overview"
            title="About the Polytechnic"
          >
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/5 bg-white/[0.02] p-6 sm:p-8">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400/[0.025] blur-3xl" />

              <p className="relative whitespace-pre-line text-[15px] leading-8 text-slate-400 sm:text-base">
                {polytechnic.description}
              </p>
            </div>
          </SectionCard>
        )}

        {/* ===================================================
            INSTITUTION DETAILS
        =================================================== */}

        <SectionCard
          icon={Award}
          eyebrow="Institution Information"
          title="Institution Details"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem
              icon={Building2}
              label="Ownership"
              value={
                polytechnic.ownership ||
                "Not provided"
              }
            />

            <DetailItem
              icon={School}
              label="Type"
              value={
                polytechnic.type ||
                "Polytechnic"
              }
            />

            <DetailItem
              icon={CalendarDays}
              label="Established"
              value={
                polytechnic.established_year ||
                "Not provided"
              }
            />

            <DetailItem
              icon={Globe}
              label="Country"
              value={
                polytechnic.country ||
                "Not provided"
              }
            />

            <DetailItem
              icon={MapPin}
              label="State"
              value={
                polytechnic.state ||
                "Not provided"
              }
            />

            <DetailItem
              icon={CheckCircle2}
              label="Status"
              value={
                polytechnic.active
                  ? "Active"
                  : "Inactive"
              }
            />
          </div>
        </SectionCard>

        {/* ===================================================
            ACADEMIC DIRECTORY
        =================================================== */}

        <SectionCard
          icon={LibraryBig}
          eyebrow="Academic Information"
          title="Explore the Complete Academic Structure"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.07] via-white/[0.025] to-transparent p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/[0.06] blur-[90px]" />

            <div className="relative">
              <div className="max-w-3xl">
                <p className="text-[15px] leading-8 text-slate-400 sm:text-base">
                  Explore the complete academic structure
                  directly from the institution's official
                  website. Get the most current information
                  about faculties, departments, courses,
                  programmes, admission requirements, and
                  other academic offerings.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <AcademicPreviewCard
                  icon={Building2}
                  title="Faculties"
                  description="Explore the institution's academic faculties and schools."
                />

                <AcademicPreviewCard
                  icon={ListTree}
                  title="Departments"
                  description="Find departments and their academic areas."
                />

                <AcademicPreviewCard
                  icon={BookMarked}
                  title="Programmes"
                  description="Discover available courses and academic programmes."
                />

                <AcademicPreviewCard
                  icon={Info}
                  title="Academic Information"
                  description="View current academic and admission information."
                />
              </div>

              {websiteUrl ? (
                <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/5 bg-black/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.07]">
                      <Globe
                        size={19}
                        className="text-cyan-400"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-black text-white">
                        Find the complete academic directory
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Academic information can change.
                        Visit the institution's official
                        website for the latest structure.
                      </p>
                    </div>
                  </div>

                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
                  >
                    Explore Academic Directory
                    <ExternalLink size={15} />
                  </a>
                </div>
              ) : (
                <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-6 text-center">
                  <Globe
                    size={27}
                    className="mx-auto text-slate-700"
                  />

                  <h3 className="mt-3 font-black text-white">
                    Official Website Unavailable
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    The official website for this
                    institution has not been provided yet.
                  </p>
                </div>
              )}
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
            title="Polytechnic Contact"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {polytechnic.email && (
                <ContactItem
                  icon={Mail}
                  label="Email"
                  value={polytechnic.email}
                  onCopy={() =>
                    handleCopy(
                      polytechnic.email,
                      "email"
                    )
                  }
                  copied={copied === "email"}
                />
              )}

              {polytechnic.phone && (
                <ContactItem
                  icon={Phone}
                  label="Phone"
                  value={polytechnic.phone}
                  onCopy={() =>
                    handleCopy(
                      polytechnic.phone,
                      "phone"
                    )
                  }
                  copied={copied === "phone"}
                />
              )}

              {polytechnic.address && (
                <ContactItem
                  icon={MapPin}
                  label="Address"
                  value={polytechnic.address}
                  onCopy={() =>
                    handleCopy(
                      polytechnic.address,
                      "address"
                    )
                  }
                  copied={copied === "address"}
                />
              )}

              {polytechnic.city && (
                <ContactItem
                  icon={MapPin}
                  label="City"
                  value={polytechnic.city}
                  onCopy={() =>
                    handleCopy(
                      polytechnic.city,
                      "city"
                    )
                  }
                  copied={copied === "city"}
                />
              )}
            </div>

            {!polytechnic.email &&
              !polytechnic.phone &&
              !polytechnic.address &&
              !polytechnic.city && (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-7 text-center">
                  <Phone
                    size={27}
                    className="mx-auto text-slate-700"
                  />

                  <h3 className="mt-3 font-black text-white">
                    Contact Information Unavailable
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Contact information for this
                    institution has not been provided.
                  </p>
                </div>
              )}
          </SectionCard>

          {websiteUrl && (
            <motion.div
              whileHover={{
                y: -3,
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
                  {polytechnic.website}
                </p>

                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
                >
                  Visit Website
                  <ExternalLink size={16} />
                </a>
              </div>
            </motion.div>
          )}
        </div>

        {/* ===================================================
            FOOTER ACTION
        =================================================== */}

        <div className="mb-12 mt-8 flex justify-center">
          <button
            type="button"
            onClick={() =>
              navigate("/polytechnics")
            }
            className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-bold text-slate-400 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-white"
          >
            <ArrowLeft
              size={17}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />

            Explore More Polytechnics
          </button>
        </div>
      </div>
    </section>
  );
};

/* =========================================================
   ACADEMIC PREVIEW CARD
========================================================= */

const AcademicPreviewCard = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      transition={{
        duration: 0.2,
      }}
      className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.025] p-5 transition hover:border-cyan-400/15 hover:bg-cyan-400/[0.025]"
    >
      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.07]">
          <Icon
            size={19}
            className="text-cyan-400"
          />
        </div>

        <h3 className="mt-4 font-black text-white">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>
    </motion.div>
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
   DETAIL ITEM
========================================================= */

const DetailItem = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.06]">
        <Icon
          size={17}
          className="text-cyan-400"
        />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-600">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-bold text-slate-300">
          {value}
        </p>
      </div>
    </div>
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
      <div className="mb-6 flex items-center gap-4">
        {Icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.06]">
            <Icon
              size={21}
              className="text-cyan-400"
            />
          </div>
        )}

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
    <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.06]">
        <Icon
          size={18}
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
  );
};

export default PolytechnicDetails;