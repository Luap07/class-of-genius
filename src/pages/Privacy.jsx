import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  UserCheck,
  Database,
  Cookie,
  Share2,
  Settings,
  Trash2,
  FileText,
  Mail,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import cogLogo from "../assets/cog.png";

const sections = [
  {
    id: "introduction",
    number: "01",
    title: "Introduction",
    icon: ShieldCheck,
    content: (
      <>
        <p>
          Your privacy is important to us. This Privacy Policy explains how
          information may be collected, used, stored, and protected when you
          access or use our educational platform.
        </p>

        <p>
          This policy applies to information associated with your use of the
          platform, including learning activities, account features, academic
          resources, and other services made available through the platform.
        </p>
      </>
    ),
  },

  {
    id: "information-collected",
    number: "02",
    title: "Information We Collect",
    icon: Database,
    content: (
      <>
        <p>
          Depending on how you use the platform, we may collect information
          necessary to provide and improve our services.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            "Account and profile information.",
            "Learning and course activity.",
            "CBT practice and assessment information.",
            "Technical and device information.",
            "Messages and support requests.",
            "Preferences and platform settings.",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
              <span className="text-sm leading-6 text-slate-300">
                {item}
              </span>
            </div>
          ))}
        </div>
      </>
    ),
  },

  {
    id: "account-information",
    number: "03",
    title: "Account Information",
    icon: UserCheck,
    content: (
      <>
        <p>
          If you create an account, information such as your name, email
          address, profile details, and authentication information may be
          processed to provide account functionality.
        </p>

        <p>
          You are responsible for ensuring that information provided through
          your account is accurate and for keeping your account credentials
          secure.
        </p>
      </>
    ),
  },

  {
    id: "learning-data",
    number: "04",
    title: "Learning & Academic Activity",
    icon: FileText,
    content: (
      <>
        <p>
          When you use learning features, the platform may process information
          related to your activity, such as courses accessed, lessons
          completed, practice sessions, scores, progress, or other learning
          interactions.
        </p>

        <p>
          This information may be used to provide learning features, maintain
          progress, improve the platform, and help create a more useful
          educational experience.
        </p>
      </>
    ),
  },

  {
    id: "usage",
    number: "05",
    title: "How We Use Information",
    icon: Settings,
    content: (
      <>
        <p>Information may be used for purposes such as:</p>

        <div className="mt-5 space-y-3">
          {[
            "Providing and maintaining platform services.",
            "Managing user accounts and authentication.",
            "Saving learning progress and preferences.",
            "Improving courses, features, and user experience.",
            "Responding to support requests and communications.",
            "Maintaining platform security and preventing abuse.",
            "Understanding how platform features are used.",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
              <span className="text-sm leading-6 text-slate-300">
                {item}
              </span>
            </div>
          ))}
        </div>
      </>
    ),
  },

  {
    id: "cookies",
    number: "06",
    title: "Cookies & Similar Technologies",
    icon: Cookie,
    content: (
      <>
        <p>
          The platform may use cookies, local storage, or similar technologies
          to support essential functionality, remember preferences, maintain
          sessions, and understand how users interact with the platform.
        </p>

        <p>
          Some features may not function correctly if certain browser storage
          or cookie technologies are disabled.
        </p>
      </>
    ),
  },

  {
    id: "security",
    number: "07",
    title: "Data Security",
    icon: Lock,
    content: (
      <>
        <p>
          We take reasonable measures to protect information against
          unauthorized access, alteration, disclosure, or destruction.
        </p>

        <p>
          However, no online service or electronic storage system can be
          guaranteed to be completely secure. You should also take appropriate
          steps to protect your account credentials and devices.
        </p>
      </>
    ),
  },

  {
    id: "sharing",
    number: "08",
    title: "Sharing Information",
    icon: Share2,
    content: (
      <>
        <p>
          We do not treat your personal information as something to be openly
          published. Information may be shared or processed where reasonably
          necessary to operate the platform, provide requested services,
          maintain security, comply with legal obligations, or work with
          service providers supporting the platform.
        </p>

        <p>
          Third-party service providers may process information on our behalf
          where necessary to provide infrastructure, authentication, storage,
          communication, analytics, or other technical services.
        </p>
      </>
    ),
  },

  {
    id: "third-party",
    number: "09",
    title: "Third-Party Services",
    icon: ChevronRight,
    content: (
      <>
        <p>
          The platform may contain links to or integrations with external
          websites and services. These third-party services may have their own
          privacy policies and practices.
        </p>

        <p>
          We encourage you to review the privacy policies of external services
          before providing information directly to them.
        </p>
      </>
    ),
  },

  {
    id: "children",
    number: "10",
    title: "Children & Young Users",
    icon: UserCheck,
    content: (
      <>
        <p>
          The platform provides educational resources that may be useful to
          students of different ages. Where applicable, parents, guardians,
          schools, or other responsible adults should help younger users
          understand appropriate use of online educational services.
        </p>

        <p>
          If you believe that information belonging to a child has been
          provided improperly, please contact us so that the matter can be
          reviewed.
        </p>
      </>
    ),
  },

  {
    id: "retention",
    number: "11",
    title: "Data Retention",
    icon: Database,
    content: (
      <>
        <p>
          Information may be retained for as long as reasonably necessary to
          provide services, maintain records, meet legitimate operational
          requirements, resolve disputes, enforce agreements, or comply with
          applicable legal obligations.
        </p>

        <p>
          The period for which information is retained may vary depending on
          the type of information and the reason it was collected.
        </p>
      </>
    ),
  },

  {
    id: "rights",
    number: "12",
    title: "Your Privacy Choices",
    icon: UserCheck,
    content: (
      <>
        <p>
          Depending on applicable law and the features available on the
          platform, you may have rights relating to your personal information.
        </p>

        <div className="mt-5 space-y-3">
          {[
            "Request information about personal data associated with your account.",
            "Request correction of inaccurate information.",
            "Request deletion where applicable.",
            "Manage certain account or communication preferences.",
            "Ask questions about how your information is handled.",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
              <span className="text-sm leading-6 text-slate-300">
                {item}
              </span>
            </div>
          ))}
        </div>
      </>
    ),
  },

  {
    id: "deletion",
    number: "13",
    title: "Account & Data Deletion",
    icon: Trash2,
    content: (
      <>
        <p>
          Where account deletion functionality is available, you may use the
          appropriate account controls to request deletion of your account.
        </p>

        <p>
          Some information may need to be retained where required for security,
          legal, fraud-prevention, dispute-resolution, or other legitimate
          purposes.
        </p>
      </>
    ),
  },

  {
    id: "changes",
    number: "14",
    title: "Changes to This Privacy Policy",
    icon: FileText,
    content: (
      <>
        <p>
          We may update this Privacy Policy when our services, technology,
          legal obligations, or data practices change.
        </p>

        <p>
          Updated versions may be published on this page. Where appropriate,
          significant changes may also be communicated through the platform or
          other suitable channels.
        </p>
      </>
    ),
  },

  {
    id: "contact",
    number: "15",
    title: "Contact Us",
    icon: Mail,
    content: (
      <>
        <p>
          If you have questions about this Privacy Policy or how information is
          handled on the platform, you can contact us through the official
          contact channel.
        </p>

        <button
          onClick={() => navigate("/contact")}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
        >
          <Mail size={17} />
          Contact Us
        </button>
      </>
    ),
  },
];

const Privacy = () => {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#020617] text-white">
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

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/80 backdrop-blur-2xl">
        <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-5 py-4 sm:px-8">
          <div>
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
          </div>

          <div className="flex justify-center">
            <img
              src={cogLogo}
              alt="Class Of Genius"
              className="h-9 w-9 object-contain"
            />
          </div>

          <div className="flex justify-end">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 sm:text-sm">
              Privacy Policy
            </span>
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
              Privacy & Security
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Privacy
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                Policy
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-400 sm:text-lg">
              This Privacy Policy explains how information may be collected,
              used, protected, and managed when you use our educational
              platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Document
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-200">
                  Privacy Policy
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Protection
                </p>

                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Data Protection
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="relative grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Desktop Quick Navigation */}
          <aside className="hidden lg:block self-start sticky top-28">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
                  On this page
                </p>

                <h2 className="mt-2 text-lg font-bold text-white">
                  Quick Navigation
                </h2>
              </div>

              <div className="space-y-1">
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

          {/* Mobile Quick Navigation */}
          <div className="lg:hidden">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
                  On this page
                </p>

                <h2 className="mt-2 text-lg font-bold text-white">
                  Quick Navigation
                </h2>
              </div>

              <div className="space-y-1">
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
          </div>

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
                    Your privacy matters
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    We aim to handle information responsibly and provide
                    appropriate controls and safeguards around the information
                    associated with your use of the platform.
                  </p>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 py-10 sm:px-8">
          {/* Logo */}
          <div className="flex flex-col items-center">
            <img
              src={cogLogo}
              alt="Class Of Genius"
              className="h-14 w-14 object-contain"
            />

            <p className="mt-3 text-sm font-bold text-white">
              Scholiqen
            </p>

            <p className="mt-1 text-center text-xs text-slate-500">
              Learn. Practice. Grow.
            </p>
          </div>

          {/* Footer Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-slate-500">
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

            <button
              onClick={() => navigate("/privacy")}
              className="text-blue-400 transition hover:text-blue-300"
            >
              Privacy
            </button>

            <button
              onClick={() => navigate("/terms")}
              className="transition hover:text-white"
            >
              Terms
            </button>
          </div>

          {/* Copyright */}
          <div className="h-px w-full max-w-xl bg-white/10" />

          <p className="text-center text-xs text-slate-600">
            © {new Date().getFullYear()} Scholiqen. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;