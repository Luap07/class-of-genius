import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Globe,
  GraduationCap,
  Mail,
  Send,
  User,
  Briefcase,
  Clock3,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cog from "../../assets/cog.png";

/* =========================================================
   INSTRUCTOR APPLICATION EMAIL
========================================================= */

const INSTRUCTOR_EMAIL = "scholiqen@gmail.com";

/* =========================================================
   BENEFITS
========================================================= */

const benefits = [
  "Teach thousands of students worldwide",
  "Create premium online courses",
  "Earn from your knowledge",
  "Build your personal brand",
  "Reach learners across different countries",
  "Access modern teaching tools",
  "Track student learning and performance",
  "Become part of the Scholiqen educator community",
];

/* =========================================================
   APPLICATION REQUIREMENTS
========================================================= */

const applicationSections = [
  {
    icon: User,
    title: "Personal Information",
    items: [
      "Full name",
      "Professional email address",
      "Phone number",
      "Country",
      "City or state",
    ],
  },
  {
    icon: Briefcase,
    title: "Professional Background",
    items: [
      "Area of expertise",
      "Years of professional experience",
      "Current occupation",
      "Professional background",
      "Relevant skills",
    ],
  },
  {
    icon: GraduationCap,
    title: "Education & Certifications",
    items: [
      "Highest educational qualification",
      "School or institution attended",
      "Professional certifications",
      "Relevant training",
    ],
  },
  {
    icon: BookOpen,
    title: "Proposed Course",
    items: [
      "Course title",
      "Course level",
      "Course description",
      "Topics students will learn",
      "Target students",
      "Expected learning outcomes",
    ],
  },
  {
    icon: Award,
    title: "Teaching Experience",
    items: [
      "Previous teaching experience",
      "Tutoring or mentoring experience",
      "Workshops or bootcamps",
      "Online teaching experience",
      "Preferred teaching availability",
    ],
  },
  {
    icon: Globe,
    title: "Online Presence",
    items: [
      "Personal website",
      "LinkedIn profile",
      "YouTube channel",
      "Portfolio",
      "Other professional profiles",
    ],
  },
];

/* =========================================================
   EMAIL TEMPLATE
========================================================= */

const buildEmailBody = () => {
  return `Dear Scholiqen Instructor Review Team,

I would like to apply to become an instructor on Scholiqen.

Please find my instructor application below.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERSONAL INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full Name:
Professional Email:
Phone Number:
Country:
City / State:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFESSIONAL BACKGROUND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Area of Expertise:
Years of Experience:
Current Occupation:
Professional Background:
Relevant Skills:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EDUCATION & CERTIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Highest Qualification:
Institution:
Certifications:
Relevant Training:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROPOSED COURSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Course Title:
Course Level:
Course Description:

What will students learn?

1.
2.
3.
4.

Target Students:

Expected Learning Outcomes:

1.
2.
3.
4.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEACHING EXPERIENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Previous Teaching Experience:

Tutoring / Mentoring Experience:

Workshops / Bootcamps:

Online Teaching Experience:

Preferred Availability:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ONLINE PRESENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Website:

LinkedIn:

YouTube:

Portfolio:

Other Professional Profile:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCTOR DECLARATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I confirm that the information provided in this application is accurate.

I agree to follow Scholiqen's instructor policies and code of conduct.

I confirm that the educational materials I provide will be original or properly licensed.

I agree to maintain professional and high-quality educational standards.

I understand that my application will be reviewed before I am approved as an instructor.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Additional Information:

Why would you like to become a Scholiqen instructor?

What makes you qualified to teach this subject?

Is there anything else you would like the review team to know?

Thank you for considering my application.

Best regards,

Full Name:
Email:
Phone:
`;
};

/* =========================================================
   EMAIL HANDLER
========================================================= */

const handleApplyViaEmail = () => {
  const subject = encodeURIComponent(
    "Scholiqen Instructor Application"
  );

  const body = encodeURIComponent(
    buildEmailBody()
  );

  const gmailUrl =
    `https://mail.google.com/mail/?view=cm&fs=1&to=${INSTRUCTOR_EMAIL}&su=${subject}&body=${body}`;

  window.open(gmailUrl, "_blank", "noopener,noreferrer");
};

/* =========================================================
   COMPONENT
========================================================= */

const BecomeInstructorForm = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft
              size={18}
              className="transition-transform group-hover:-translate-x-1"
            />

            Back
          </button>

          <div className="flex items-center gap-3">

            <img
              src={Cog}
              alt="Scholiqen"
              className="h-9 w-9 object-contain"
            />

            <span className="hidden font-black sm:block">
              Scholiqen
            </span>

          </div>

        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-white/10">

        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="absolute -right-40 top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="max-w-4xl"
          >

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-400">

              <Sparkles size={14} />

              Instructor Program

            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">

              Become a{" "}

              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Scholiqen Instructor
              </span>

            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-400 sm:text-lg">

              Share your knowledge, create meaningful learning
              experiences, reach students around the world and
              grow your educational career with Scholiqen.

            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">

                <CheckCircle2
                  size={17}
                  className="text-emerald-400"
                />

                No complicated registration

              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">

                <Mail
                  size={17}
                  className="text-cyan-400"
                />

                Apply directly by email

              </div>

            </div>

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside>

            <div className="sticky top-24 space-y-6">

              {/* BRAND CARD */}

              <div className="overflow-hidden rounded-[30px] border border-white/10 bg-slate-900">

                <div className="relative p-7">

                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />

                  <div className="relative flex items-center gap-4">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-slate-950">

                      <img
                        src={Cog}
                        alt="Scholiqen"
                        className="h-12 w-12 object-contain"
                      />

                    </div>

                    <div>

                      <h2 className="text-2xl font-black">
                        Scholiqen
                      </h2>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Empowering Educators
                      </p>

                    </div>

                  </div>

                  <div className="relative mt-7">

                    <p className="text-sm leading-7 text-slate-400">

                      Turn your knowledge into impact.
                      Teach students, build your professional
                      identity and contribute to the future of
                      digital education.

                    </p>

                  </div>

                </div>

              </div>

              {/* BENEFITS */}

              <div className="rounded-[30px] border border-white/10 bg-slate-900 p-7">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">

                    <Sparkles
                      size={19}
                      className="text-blue-400"
                    />

                  </div>

                  <h3 className="text-lg font-black">
                    Why Teach With Us?
                  </h3>

                </div>

                <div className="mt-6 space-y-4">

                  {benefits.map((benefit) => (

                    <div
                      key={benefit}
                      className="flex items-start gap-3"
                    >

                      <CheckCircle2
                        size={17}
                        className="mt-0.5 shrink-0 text-emerald-400"
                      />

                      <span className="text-sm leading-6 text-slate-300">
                        {benefit}
                      </span>

                    </div>

                  ))}

                </div>

              </div>

              {/* EMAIL CARD */}

              <div className="rounded-[30px] border border-cyan-400/20 bg-cyan-400/5 p-7">

                <Mail
                  size={24}
                  className="text-cyan-400"
                />

                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Applications
                </p>

                <p className="mt-2 break-all text-sm font-bold text-white">
                  {INSTRUCTOR_EMAIL}
                </p>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Your completed application will be
                  addressed to this email when you click
                  the application button.
                </p>

              </div>

            </div>

          </aside>

          {/* =================================================
              APPLICATION INFORMATION
          ================================================= */}

          <div className="space-y-8">

            {/* INTRO */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="rounded-[32px] border border-white/10 bg-slate-900 p-7 sm:p-10"
            >

              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

                <div>

                  <div className="mb-4 flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">

                      <FileText
                        size={21}
                        className="text-blue-400"
                      />

                    </div>

                    <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-400">
                      Application Guide
                    </span>

                  </div>

                  <h2 className="text-3xl font-black">
                    What We Need From You
                  </h2>

                  <p className="mt-4 max-w-2xl leading-7 text-slate-400">

                    There is no traditional online form to
                    complete here. Simply review the information
                    required below and click the email application
                    button. Your personal email application will
                    open with the complete template ready for you
                    to fill in.

                  </p>

                </div>

              </div>

            </motion.div>

            {/* =================================================
                REQUIREMENT CARDS
            ================================================= */}

            <div className="space-y-5">

              {applicationSections.map(
                (section, index) => {

                  const Icon = section.icon;

                  return (
                    <motion.div
                      key={section.title}
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.05,
                      }}
                      className="group rounded-[28px] border border-white/10 bg-slate-900 p-6 transition hover:border-blue-500/30 sm:p-8"
                    >

                      <div className="flex gap-5">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">

                          <Icon
                            size={21}
                            className="text-blue-400"
                          />

                        </div>

                        <div className="min-w-0 flex-1">

                          <h3 className="text-xl font-black">
                            {section.title}
                          </h3>

                          <div className="mt-5 grid gap-3 sm:grid-cols-2">

                            {section.items.map(
                              (item) => (

                                <div
                                  key={item}
                                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-slate-950/60 px-4 py-3"
                                >

                                  <CheckCircle2
                                    size={15}
                                    className="shrink-0 text-emerald-400"
                                  />

                                  <span className="text-sm text-slate-300">
                                    {item}
                                  </span>

                                </div>

                              )
                            )}

                          </div>

                        </div>

                      </div>

                    </motion.div>
                  );
                }
              )}

            </div>

            {/* =================================================
                IMPORTANT INFORMATION
            ================================================= */}

            <div className="rounded-[30px] border border-amber-400/20 bg-amber-400/5 p-7 sm:p-8">

              <div className="flex gap-4">

                <ShieldCheck
                  size={24}
                  className="mt-1 shrink-0 text-amber-400"
                />

                <div>

                  <h3 className="font-black text-white">
                    Before You Apply
                  </h3>

                  <div className="mt-4 space-y-3 text-sm leading-6 text-slate-400">

                    <p>
                      Make sure the information you provide
                      is accurate and complete.
                    </p>

                    <p>
                      Your proposed course should provide
                      genuine educational value to students.
                    </p>

                    <p>
                      Teaching materials must be original or
                      properly licensed for use.
                    </p>

                    <p>
                      Every application is reviewed before an
                      applicant is approved as an instructor.
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                APPLY CARD
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="relative overflow-hidden rounded-[35px] border border-blue-500/20 bg-gradient-to-br from-blue-600/10 via-slate-900 to-cyan-500/5 p-8 sm:p-10"
            >

              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/20">

                  <Send
                    size={25}
                    className="text-white"
                  />

                </div>

                <h2 className="mt-6 text-3xl font-black">
                  Ready to Become an Instructor?
                </h2>

                <p className="mt-4 max-w-2xl leading-7 text-slate-400">

                  Click the button below. Your personal email
                  application will open with your application
                  addressed directly to the Scholiqen instructor
                  review team.

                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">

                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">

                    <Mail
                      size={16}
                      className="text-cyan-400"
                    />

                    {INSTRUCTOR_EMAIL}

                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-400">

                    <Clock3 size={16} />

                    Review required

                  </div>

                </div>

                <button
                  type="button"
                  onClick={handleApplyViaEmail}
                  className="group mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-7 py-5 text-base font-black text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500 sm:w-auto"
                >

                  <Mail size={21} />

                  Apply via Email

                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                  />

                </button>

                <p className="mt-4 text-xs leading-5 text-slate-500">

                  Clicking this button opens the email application
                  installed or configured on the applicant's device.
                  They will review the message, complete the required
                  information and press Send.

                </p>

              </div>

            </motion.div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-center sm:flex-row sm:px-8 sm:text-left">

          <div className="flex items-center gap-3">

            <img
              src={Cog}
              alt="Scholiqen"
              className="h-8 w-8 object-contain"
            />

            <span className="text-sm font-bold text-slate-400">
              Scholiqen Instructor Program
            </span>

          </div>

          <p className="text-xs text-slate-600">
            Learn • Teach • Inspire
          </p>

        </div>

      </footer>

    </main>
  );
};

export default BecomeInstructorForm;

