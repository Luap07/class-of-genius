// src/pages/Terms.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  FileText,
  Gavel,
  Lock,
  ShieldCheck,
  UserCheck,
  BookOpen,
  AlertTriangle,
  RefreshCw,
  Mail,
  Scale,
  Ban,
  Copyright,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import cogLogo from "../assets/cog.png";

const sections = [
  {
    id: "acceptance",
    number: "01",
    title: "Acceptance of Terms",
    icon: FileText,
    content: (
      <>
        <p>
          By accessing or using this platform, you agree to be bound by these
          Terms and Conditions and all applicable laws and regulations. If you
          do not agree with any part of these terms, you should discontinue use
          of the platform.
        </p>

        <p>
          These terms apply to all visitors, students, instructors,
          administrators, and other users who access or interact with the
          services provided through the platform.
        </p>
      </>
    ),
  },

  {
    id: "eligibility",
    number: "02",
    title: "Eligibility",
    icon: UserCheck,
    content: (
      <>
        <p>
          You must provide accurate information when creating or using an
          account on the platform. You are responsible for ensuring that your
          use of the platform complies with the laws applicable to you.
        </p>

        <p>
          Where an account is created on behalf of a student or another
          individual, the person creating the account must have the appropriate
          authority to do so.
        </p>
      </>
    ),
  },

  {
    id: "accounts",
    number: "03",
    title: "User Accounts",
    icon: ShieldCheck,
    content: (
      <>
        <p>
          Certain features may require you to create an account. You are
          responsible for maintaining the confidentiality of your login
          credentials and for activities performed through your account.
        </p>

        <p>
          You agree to notify the platform promptly if you believe that your
          account has been accessed without authorization.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            "Keep your login information secure.",
            "Provide truthful account information.",
            "Do not share your account credentials.",
            "Notify us of unauthorized access.",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
              <span className="text-sm leading-6 text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },

  {
    id: "educational-content",
    number: "04",
    title: "Educational Content",
    icon: BookOpen,
    content: (
      <>
        <p>
          The platform provides educational resources intended to support
          learning, academic preparation, research, and personal development.
        </p>

        <p>
          Educational content may include courses, lessons, study materials,
          examination resources, practice questions, articles, documents,
          videos, language materials, virtual learning experiences, and other
          academic resources.
        </p>

        <p>
          While we aim to provide useful and accurate educational information,
          users should understand that educational materials may contain
          errors, omissions, outdated information, or content that requires
          further verification.
        </p>
      </>
    ),
  },

  {
    id: "courses",
    number: "05",
    title: "Courses & Learning Materials",
    icon: BookOpen,
    content: (
      <>
        <p>
          Access to courses and learning materials may depend on your account,
          enrollment status, subscription, or other conditions established by
          the platform.
        </p>

        <p>
          You may use educational materials only for lawful personal,
          educational, or otherwise authorized purposes. Copying, distributing,
          reselling, republishing, or commercially exploiting protected
          materials without permission is prohibited.
        </p>
      </>
    ),
  },

  {
    id: "examinations",
    number: "06",
    title: "CBT & Examination Services",
    icon: Gavel,
    content: (
      <>
        <p>
          Examination and computer-based testing features are provided to
          support learning, practice, assessment, and academic preparation.
        </p>

        <p>
          Practice scores, results, rankings, and other assessment information
          should not automatically be considered official academic results
          unless expressly stated by the relevant institution or examination
          authority.
        </p>

        <p>
          Users must not attempt to manipulate examination systems, obtain
          unauthorized answers, interfere with testing functionality, or use
          the platform to facilitate academic dishonesty.
        </p>
      </>
    ),
  },

  {
    id: "responsibilities",
    number: "07",
    title: "User Responsibilities",
    icon: UserCheck,
    content: (
      <>
        <p>
          Users are expected to interact with the platform responsibly and
          respectfully.
        </p>

        <div className="mt-6 space-y-3">
          {[
            "Use the platform only for lawful purposes.",
            "Respect other users, instructors, institutions, and administrators.",
            "Do not submit false, misleading, or fraudulent information.",
            "Do not attempt to gain unauthorized access to systems or accounts.",
            "Do not interfere with the normal operation of the platform.",
            "Do not upload malicious software, harmful files, or abusive content.",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
              <span className="text-sm leading-6 text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },

  {
    id: "prohibited",
    number: "08",
    title: "Prohibited Activities",
    icon: Ban,
    content: (
      <>
        <p>
          You may not use the platform to engage in activities that violate
          these terms, applicable laws, or the rights of others.
        </p>

        <div className="mt-6 grid gap-3">
          {[
            "Attempting to bypass authentication or security controls.",
            "Accessing data or accounts without authorization.",
            "Introducing malware, viruses, or other harmful code.",
            "Scraping or systematically collecting platform data without permission.",
            "Impersonating another person or organization.",
            "Using the platform to distribute unlawful or harmful material.",
            "Attempting to disrupt platform availability or infrastructure.",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-red-400/10 bg-red-400/[0.03] p-4"
            >
              <Ban className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <span className="text-sm leading-6 text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },

  {
    id: "intellectual-property",
    number: "09",
    title: "Intellectual Property",
    icon: Copyright,
    content: (
      <>
        <p>
          Unless otherwise stated, the platform, its design, branding,
          interface, software, original educational materials, graphics,
          written content, and other original assets are protected by
          applicable intellectual property laws.
        </p>

        <p>
          Nothing in these terms grants you ownership of the platform or its
          intellectual property. You receive only the limited permission
          necessary to access and use the services in accordance with these
          terms.
        </p>

        <p>
          Third-party materials remain the property of their respective owners
          and may be subject to separate terms or licenses.
        </p>
      </>
    ),
  },

  {
    id: "third-party",
    number: "10",
    title: "Third-Party Services",
    icon: ChevronRight,
    content: (
      <>
        <p>
          The platform may integrate with or provide links to third-party
          services, websites, applications, payment providers, educational
          resources, or other external services.
        </p>

        <p>
          Third-party services are generally governed by their own terms,
          policies, and privacy practices. We are not responsible for the
          content, availability, security, or practices of third-party
          services that are outside our control.
        </p>
      </>
    ),
  },

  {
    id: "privacy",
    number: "11",
    title: "Privacy & Personal Information",
    icon: Lock,
    content: (
      <>
        <p>
          We recognize the importance of protecting information associated with
          your use of the platform. Information collected through the platform
          may be handled in accordance with our Privacy Policy.
        </p>

        <p>
          By using the platform, you acknowledge that certain information may
          be collected and processed where necessary to provide, maintain,
          secure, and improve the services.
        </p>

        <p>
          Please review the Privacy Policy for more information about how
          personal information is handled.
        </p>
      </>
    ),
  },

  {
    id: "availability",
    number: "12",
    title: "Platform Availability",
    icon: RefreshCw,
    content: (
      <>
        <p>
          We aim to keep the platform available and reliable, but continuous
          availability cannot be guaranteed.
        </p>

        <p>
          Services may occasionally be unavailable because of maintenance,
          updates, technical problems, security incidents, network failures, or
          circumstances outside our reasonable control.
        </p>
      </>
    ),
  },

  {
    id: "disclaimer",
    number: "13",
    title: "Disclaimer",
    icon: AlertTriangle,
    content: (
      <>
        <p>
          The platform and its services are provided on an availability basis.
          To the extent permitted by applicable law, we do not guarantee that
          the platform will always be uninterrupted, error-free, completely
          accurate, or suitable for every particular purpose.
        </p>

        <p>
          Educational information available through the platform should not be
          treated as a substitute for official instructions, professional
          advice, institutional requirements, or authoritative examination
          information where such sources are applicable.
        </p>
      </>
    ),
  },

  {
    id: "limitation",
    number: "14",
    title: "Limitation of Liability",
    icon: Scale,
    content: (
      <>
        <p>
          To the maximum extent permitted by applicable law, the platform and
          its operators will not be responsible for indirect, incidental,
          consequential, special, or similar losses arising from or related to
          your use of the platform.
        </p>

        <p>
          This limitation applies to losses resulting from interruptions,
          technical issues, loss of data, reliance on educational information,
          third-party services, or other circumstances connected with use of
          the platform, except where liability cannot legally be excluded.
        </p>
      </>
    ),
  },

  {
    id: "termination",
    number: "15",
    title: "Account Suspension & Termination",
    icon: ShieldCheck,
    content: (
      <>
        <p>
          We may restrict, suspend, or terminate access to an account or
          particular services where we reasonably believe that a user has
          violated these terms, engaged in harmful activity, or created a
          significant risk to the platform or other users.
        </p>

        <p>
          Where appropriate and reasonably possible, we may provide notice
          before taking such action. However, immediate action may be necessary
          where security, legal, or operational concerns require it.
        </p>
      </>
    ),
  },

  {
    id: "changes",
    number: "16",
    title: "Changes to These Terms",
    icon: RefreshCw,
    content: (
      <>
        <p>
          We may update these Terms and Conditions from time to time to reflect
          changes in our services, technology, legal requirements, or
          operational practices.
        </p>

        <p>
          When material changes are made, we may provide notice through the
          platform or other appropriate channels. Your continued use of the
          platform after updated terms become effective constitutes acceptance
          of the revised terms.
        </p>
      </>
    ),
  },

  {
    id: "contact",
    number: "17",
    title: "Contact Us",
    icon: Mail,
    content: (
      <>
        <p>
          If you have questions, concerns, or requests regarding these Terms
          and Conditions, you can contact us through the platform's official
          contact channel.
        </p>

        <p>
          We encourage users to contact us whenever clarification is needed
          regarding the use of our services or educational resources.
        </p>
      </>
    ),
  },
];

const Terms = () => {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_30%)]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-white"
          >
            <ArrowLeft
              size={18}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back
          </button>

          <div className="flex items-center gap-2.5 text-sm text-slate-400">
            <img src={cogLogo} alt="Logo" className="h-5 w-5 object-contain" />
            <span className="hidden sm:inline">Terms & Conditions</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8 lg:pt-16">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-12 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 shadow-2xl shadow-blue-950/20 sm:p-10 lg:p-14"
        >
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
              <ShieldCheck size={15} />
              Legal & Guidelines
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Terms &
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                Conditions
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-400 sm:text-lg">
              These Terms and Conditions explain the rules, responsibilities,
              and guidelines that apply when you access and use our educational
              platform and its services.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Document
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-200">
                  Terms & Conditions
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Status
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Active
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] items-start">
          {/* Table of Contents / Sidebar */}
          <aside className="sticky top-24 z-10">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
                  On this page
                </p>

                <h2 className="mt-2 text-lg font-bold text-white">
                  Quick Navigation
                </h2>
              </div>

              <div className="max-h-[calc(100vh-12rem)] space-y-1 overflow-y-auto pr-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-blue-500/10"
                  >
                    <span className="w-7 text-[10px] font-bold text-slate-600 transition-colors group-hover:text-blue-400">
                      {section.number}
                    </span>

                    <span className="flex-1 text-xs leading-5 text-slate-400 transition-colors group-hover:text-white">
                      {section.title}
                    </span>

                    <ChevronRight
                      size={14}
                      className="text-slate-700 transition-all group-hover:translate-x-0.5 group-hover:text-blue-400"
                    />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Content */}
          <section className="space-y-5">
            {sections.map((section, index) => {
              const Icon = section.icon;

              return (
                <motion.article
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(index * 0.02, 0.15),
                  }}
                  className="scroll-mt-28 rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-xl shadow-black/10 transition-colors hover:border-white/15 sm:p-8"
                >
                  <div className="flex gap-5">
                    <div className="hidden shrink-0 sm:block">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
                        <Icon className="h-5 w-5 text-blue-400" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold tracking-widest text-blue-400">
                          {section.number}
                        </span>

                        <div className="h-px flex-1 bg-gradient-to-r from-blue-500/20 to-transparent" />
                      </div>

                      <h2 className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
                        {section.title}
                      </h2>

                      <div className="mt-5 space-y-4 text-sm leading-7 text-slate-400 sm:text-[15px]">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}

            {/* Final Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-blue-400/15 bg-gradient-to-br from-blue-500/[0.08] to-cyan-500/[0.03] p-6 sm:p-8"
            >
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10">
                  <ShieldCheck className="h-5 w-5 text-blue-400" />
                </div>

                <div>
                  <h3 className="font-bold text-white">
                    Thank you for using our platform
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    By continuing to use the platform, you acknowledge that
                    you have read, understood, and agreed to these Terms and
                    Conditions.
                  </p>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img src={cogLogo} alt="Logo" className="h-6 w-6 object-contain" />
            <div>
              <p className="text-sm font-semibold text-white">
                Terms & Conditions
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Please review these terms carefully before using the platform.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500">
            <button
              onClick={() => navigate("/privacy")}
              className="transition hover:text-white"
            >
              Privacy
            </button>

            <button
              onClick={() => navigate("/help")}
              className="transition hover:text-white"
            >
              Help
            </button>

            <button
              onClick={() => navigate("/contact")}
              className="transition hover:text-white"
            >
              Contact
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Terms;