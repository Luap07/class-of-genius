import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Wrench,
  MapPin,
  Phone,
  Mail,
  Globe,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Users,
  Award,
  Building2,
} from "lucide-react";

const PolytechnicDetails = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const polytechnic = state?.polytechnic;

  if (!polytechnic) {
    return (
      <section className="min-h-screen bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-5xl">

          <button
            onClick={() => navigate("/polytechnics")}
            className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Polytechnics
          </button>

          <div className="rounded-3xl border border-white/10 bg-slate-900 p-10 text-center">
            <Wrench
              size={50}
              className="mx-auto text-cyan-400"
            />

            <h1 className="mt-5 text-3xl font-black">
              Polytechnic Not Found
            </h1>

            <p className="mt-3 text-slate-400">
              Select a polytechnic from the directory to view
              its details.
            </p>
          </div>

        </div>
      </section>
    );
  }

  const faculties = polytechnic.faculties || [];
  const programs = polytechnic.programs || [];

  return (
    <section className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            BACK BUTTON
        ===================================================== */}

        <button
          onClick={() => navigate("/polytechnics")}
          className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Polytechnics
        </button>

        {/* =====================================================
            HERO
        ===================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800"
        >

          {polytechnic.image && (
            <div className="absolute inset-0">
              <img
                src={polytechnic.image}
                alt={polytechnic.name}
                className="h-full w-full object-cover opacity-20"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/60" />
            </div>
          )}

          <div className="relative z-10 grid gap-10 p-8 lg:grid-cols-[1fr_280px] lg:p-12">

            {/* INFORMATION */}

            <div>

              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                <Wrench
                  size={32}
                  className="text-cyan-400"
                />
              </div>

              <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                Polytechnic
              </span>

              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
                {polytechnic.name}
              </h1>

              {polytechnic.shortName && (
                <p className="mt-3 text-lg font-bold text-cyan-400">
                  {polytechnic.shortName}
                </p>
              )}

              {polytechnic.description && (
                <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">
                  {polytechnic.description}
                </p>
              )}

              <div className="mt-7 flex flex-wrap gap-3">

                {polytechnic.location && (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    <MapPin
                      size={17}
                      className="text-cyan-400"
                    />
                    {polytechnic.location}
                  </div>
                )}

                {polytechnic.state && (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    <MapPin
                      size={17}
                      className="text-cyan-400"
                    />
                    {polytechnic.state}
                  </div>
                )}

                {polytechnic.country && (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    {polytechnic.country}
                  </div>
                )}

              </div>
            </div>

            {/* IMAGE / LOGO */}

            <div className="flex items-center justify-center">
              <div className="flex h-56 w-full max-w-[280px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 shadow-2xl">

                {polytechnic.logo || polytechnic.image ? (
                  <img
                    src={
                      polytechnic.logo ||
                      polytechnic.image
                    }
                    alt={polytechnic.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Wrench
                    size={70}
                    className="text-slate-600"
                  />
                )}

              </div>
            </div>

          </div>
        </motion.div>

        {/* =====================================================
            QUICK INFORMATION
        ===================================================== */}

        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <InfoCard
            icon={Wrench}
            title="Type"
            value="Polytechnic"
          />

          <InfoCard
            icon={Users}
            title="Students"
            value={
              polytechnic.studentCount ||
              "Not available"
            }
          />

          <InfoCard
            icon={CalendarDays}
            title="Established"
            value={
              polytechnic.established ||
              "Not available"
            }
          />

          <InfoCard
            icon={Award}
            title="Programs"
            value={`${programs.length || polytechnic.programCount || 0} Programs`}
          />

        </div>

        {/* =====================================================
            ABOUT
        ===================================================== */}

        <SectionCard
          icon={Building2}
          title="About the Polytechnic"
        >
          <p className="leading-8 text-slate-400">
            {polytechnic.about ||
              polytechnic.description ||
              "Information about this polytechnic will be displayed here."}
          </p>
        </SectionCard>

        {/* =====================================================
            FACULTIES & SCHOOLS
        ===================================================== */}

        <SectionCard
          icon={GraduationCap}
          title="Faculties, Schools & Departments"
        >

          {faculties.length > 0 ? (

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              {faculties.map((faculty, index) => {

                const facultyName =
                  typeof faculty === "string"
                    ? faculty
                    : faculty.name ||
                      faculty.title;

                const departments =
                  typeof faculty === "object"
                    ? faculty.departments || []
                    : [];

                return (
                  <motion.div
                    key={faculty.id || index}
                    whileHover={{ y: -5 }}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 p-5"
                  >

                    <div className="flex items-start gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                        <BookOpen
                          size={20}
                          className="text-cyan-400"
                        />
                      </div>

                      <div>

                        <h3 className="font-bold text-white">
                          {facultyName}
                        </h3>

                        {departments.length > 0 && (
                          <div className="mt-3 space-y-1">

                            {departments.map(
                              (
                                department,
                                departmentIndex
                              ) => (
                                <p
                                  key={departmentIndex}
                                  className="text-sm text-slate-500"
                                >
                                  •{" "}
                                  {typeof department ===
                                  "string"
                                    ? department
                                    : department.name ||
                                      department.title}
                                </p>
                              )
                            )}

                          </div>
                        )}

                      </div>

                    </div>

                  </motion.div>
                );
              })}

            </div>

          ) : (

            <EmptyState text="Faculty and department information has not been added yet." />

          )}

        </SectionCard>

        {/* =====================================================
            PROGRAMS
        ===================================================== */}

        <SectionCard
          icon={BookOpen}
          title="Technical Programs & Courses"
        >

          {programs.length > 0 ? (

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {programs.map((program, index) => (

                <div
                  key={program.id || index}
                  className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 transition hover:border-cyan-400/20"
                >

                  <h3 className="font-bold text-white">
                    {typeof program === "string"
                      ? program
                      : program.name ||
                        program.title}
                  </h3>

                  {typeof program === "object" &&
                    program.description && (
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {program.description}
                      </p>
                    )}

                </div>

              ))}

            </div>

          ) : (

            <EmptyState text="Program information has not been added yet." />

          )}

        </SectionCard>

        {/* =====================================================
            QUALIFICATIONS
        ===================================================== */}

        <SectionCard
          icon={Award}
          title="Qualifications & Certificates"
        >

          {polytechnic.qualifications?.length > 0 ? (

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {polytechnic.qualifications.map(
                (qualification, index) => (

                  <div
                    key={index}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 p-5"
                  >

                    <h3 className="font-bold text-white">
                      {typeof qualification ===
                      "string"
                        ? qualification
                        : qualification.name ||
                          qualification.title}
                    </h3>

                    {typeof qualification ===
                      "object" &&
                      qualification.description && (
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {qualification.description}
                        </p>
                      )}

                  </div>

                )
              )}

            </div>

          ) : (

            <EmptyState text="Qualification information has not been added yet." />

          )}

        </SectionCard>

        {/* =====================================================
            ADMISSION
        ===================================================== */}

        <SectionCard
          icon={GraduationCap}
          title="Admission Information"
        >

          <div className="grid gap-5 md:grid-cols-2">

            <DetailItem
              label="Admission Requirements"
              value={
                polytechnic.admissionRequirements ||
                "Admission requirements will be displayed here."
              }
            />

            <DetailItem
              label="Application Information"
              value={
                polytechnic.applicationInfo ||
                "Application information will be displayed here."
              }
            />

            <DetailItem
              label="Application Website"
              value={polytechnic.applicationUrl}
              link
            />

            <DetailItem
              label="Admission Contact"
              value={
                polytechnic.admissionContact ||
                "Not available"
              }
            />

          </div>

        </SectionCard>

        {/* =====================================================
            CONTACT
        ===================================================== */}

        <SectionCard
          icon={Phone}
          title="Contact & Location"
        >

          <div className="grid gap-4 md:grid-cols-2">

            {polytechnic.address && (
              <ContactItem
                icon={MapPin}
                label="Address"
                value={polytechnic.address}
              />
            )}

            {polytechnic.phone && (
              <ContactItem
                icon={Phone}
                label="Phone"
                value={polytechnic.phone}
              />
            )}

            {polytechnic.email && (
              <ContactItem
                icon={Mail}
                label="Email"
                value={polytechnic.email}
              />
            )}

            {polytechnic.website && (
              <ContactItem
                icon={Globe}
                label="Website"
                value={polytechnic.website}
                link
              />
            )}

          </div>

        </SectionCard>

        {/* =====================================================
            BACK
        ===================================================== */}

        <div className="mb-16 flex justify-center">

          <button
            onClick={() => navigate("/polytechnics")}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            <ArrowLeft size={18} />
            Back to Polytechnics
          </button>

        </div>

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
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl">

      <div className="flex items-center gap-4">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">
          <Icon
            size={21}
            className="text-cyan-400"
          />
        </div>

        <div>

          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <p className="mt-1 font-bold text-white">
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
        duration: 0.45,
      }}
      className="mb-8 rounded-3xl border border-white/10 bg-slate-900/70 p-7 backdrop-blur-xl sm:p-8"
    >

      <div className="mb-7 flex items-center gap-4">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">
          <Icon
            size={23}
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
   DETAIL ITEM
========================================================= */

const DetailItem = ({
  label,
  value,
  link = false,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">

      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      {link && value ? (

        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block break-all text-sm leading-7 text-cyan-400 hover:underline"
        >
          {value}
        </a>

      ) : (

        <p className="mt-3 text-sm leading-7 text-slate-400">
          {value}
        </p>

      )}

    </div>
  );
};

/* =========================================================
   CONTACT ITEM
========================================================= */

const ContactItem = ({
  icon: Icon,
  label,
  value,
  link = false,
}) => {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-5">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
        <Icon
          size={19}
          className="text-cyan-400"
        />
      </div>

      <div className="min-w-0">

        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>

        {link ? (

          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block break-all text-sm leading-6 text-cyan-400 hover:underline"
          >
            {value}
          </a>

        ) : (

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {value}
          </p>

        )}

      </div>

    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({ text }) => {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-8 text-center">

      <p className="text-sm text-slate-500">
        {text}
      </p>

    </div>
  );
};

export default PolytechnicDetails;
