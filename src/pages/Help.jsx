// src/pages/Help.jsx

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Languages,
  User,
  Settings,
  ShieldCheck,
  MessageCircle,
  Mail,
  HelpCircle,
  ExternalLink,
  Sparkles,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import cogLogo from "../assets/cog.png";

const helpCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn how to navigate the platform and get started.",
    icon: Sparkles,
    color: "blue",
  },
  {
    id: "courses",
    title: "Courses & Learning",
    description: "Find answers about courses, lessons, and study materials.",
    icon: BookOpen,
    color: "cyan",
  },
  {
    id: "schools",
    title: "Schools & Programmes",
    description: "Explore universities, polytechnics, faculties, and courses.",
    icon: GraduationCap,
    color: "indigo",
  },
  {
    id: "cbt",
    title: "CBT & Examinations",
    description: "Get help with practice questions and examinations.",
    icon: ClipboardCheck,
    color: "violet",
  },
  {
    id: "languages",
    title: "Languages",
    description: "Learn about language lessons, vocabulary, and practice.",
    icon: Languages,
    color: "sky",
  },
  {
    id: "account",
    title: "Account",
    description: "Manage your profile, account, and settings.",
    icon: User,
    color: "emerald",
  },
];

const faqs = [
  {
    id: 1,
    category: "getting-started",
    question: "How do I get started?",
    answer:
      "Start by exploring the platform from the main navigation. You can browse schools and programmes, explore courses, practice CBT questions, study languages, and access other available learning resources.",
  },
  {
    id: 2,
    category: "getting-started",
    question: "How do I find a school?",
    answer:
      "Open the schools or institutions section and use the available search and filtering options. You can explore universities, polytechnics, faculties, departments, and available academic programmes.",
  },
  {
    id: 3,
    category: "courses",
    question: "How do I access a course?",
    answer:
      "Open the Courses section and select the course you want to study. Depending on the course, you may be able to access lessons, learning materials, resources, and other study features.",
  },
  {
    id: 4,
    category: "courses",
    question: "Can I continue a course later?",
    answer:
      "Yes. Where progress tracking is available, your learning progress can be used to help you continue from where you previously stopped.",
  },
  {
    id: 5,
    category: "schools",
    question: "How do I view courses under a faculty?",
    answer:
      "Open the institution profile, select the faculty you are interested in, and view the academic programmes associated with that faculty. Available courses are loaded from the platform's institution data.",
  },
  {
    id: 6,
    category: "schools",
    question: "Are the school details official?",
    answer:
      "School information is provided for educational and discovery purposes. Always verify important admission, programme, tuition, deadline, and examination information with the relevant institution before making official decisions.",
  },
  {
    id: 7,
    category: "cbt",
    question: "How does CBT practice work?",
    answer:
      "Choose an available examination or practice category and start a practice session. Your questions and results are presented through the examination interface.",
  },
  {
    id: 8,
    category: "cbt",
    question: "Are CBT practice scores official examination results?",
    answer:
      "No. Unless explicitly stated otherwise, practice scores are intended for learning and preparation and should not be treated as official examination results.",
  },
  {
    id: 9,
    category: "languages",
    question: "How can I practice a language?",
    answer:
      "Open the Languages section and choose the language you want to study. Depending on the available material, you may find vocabulary, phrases, grammar, listening, speaking, reading, or other learning activities.",
  },
  {
    id: 10,
    category: "account",
    question: "How do I manage my account?",
    answer:
      "Open your profile or account settings from the platform navigation. Available options may include profile information, preferences, security settings, and other account controls.",
  },
  {
    id: 11,
    category: "account",
    question: "What should I do if I cannot access my account?",
    answer:
      "Check that you are using the correct login information and that your internet connection is working. If the problem continues, use the available support or contact option to request assistance.",
  },
  {
    id: 12,
    category: "account",
    question: "How do I report a problem?",
    answer:
      "Use the Contact section or available support channel to report the issue. Include enough information about what happened so the problem can be investigated effectively.",
  },
];

const quickLinks = [
  {
    title: "Explore Courses",
    description: "Find learning resources and academic courses.",
    icon: BookOpen,
    path: "/courses",
  },
  {
    title: "Explore CBT",
    description: "Practice questions and examination preparation.",
    icon: ClipboardCheck,
    path: "/cbt",
  },
  {
    title: "Explore Schools",
    description: "Discover institutions and academic programmes.",
    icon: GraduationCap,
    path: "/schools",
  },
  {
    title: "Language Learning",
    description: "Explore language learning resources.",
    icon: Languages,
    path: "/languages",
  },
];

const Help = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState(null);

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "all" || faq.category === activeCategory;

      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const handleCategory = (category) => {
    setActiveCategory(category);
    setOpenFaq(null);

    setTimeout(() => {
      document
        .getElementById("faq-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_32%)]" />

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

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-1.5 shadow-inner">
            <img src={cogLogo} alt="Logo" className="h-5 w-5 object-contain" />
            <span className="hidden text-xs font-semibold tracking-wide sm:inline text-slate-300">Help Center</span>
          </div>

          <div className="w-[88px] sm:w-[104px]" /> {/* Spacer for centering layout balance */}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8 lg:pt-16">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 shadow-2xl shadow-blue-950/20 sm:p-10 lg:p-14"
        >
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300"
            >
              <Sparkles size={15} />
              Support Center
            </motion.div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              How can we
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                help you?
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              Find answers, learn how the platform works, and get help with
              courses, schools, CBT, languages, your account, and more.
            </p>

            {/* Search */}
            <div className="relative mx-auto mt-9 max-w-2xl">
              <Search
                size={20}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for help..."
                className="h-16 w-full rounded-2xl border border-white/10 bg-black/30 pl-14 pr-12 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-400/40 focus:bg-black/40 focus:ring-4 focus:ring-blue-500/10"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={17} />
                </button>
              )}
            </div>
          </div>
        </motion.section>

        {/* Categories */}
        <section className="mt-12">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
              Browse Topics
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              What do you need help with?
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {helpCategories.map((category, index) => {
              const Icon = category.icon;

              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleCategory(category.id)}
                  className={`group rounded-3xl border p-5 text-left transition-all duration-300 ${
                    activeCategory === category.id
                      ? "border-blue-400/30 bg-blue-500/[0.08] shadow-lg shadow-blue-950/20"
                      : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10">
                      <Icon className="h-5 w-5 text-blue-400" />
                    </div>

                    <ExternalLink
                      size={16}
                      className="text-slate-700 transition-all group-hover:translate-x-0.5 group-hover:text-blue-400"
                    />
                  </div>

                  <h3 className="mt-5 font-bold text-white">
                    {category.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {category.description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Quick Links */}
        <section className="mt-14">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
              Quick Access
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Go directly where you need
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;

              return (
                <motion.button
                  key={link.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(link.path)}
                  className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-left transition-all hover:border-blue-400/20 hover:bg-blue-500/[0.05]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                      <Icon size={18} className="text-blue-400" />
                    </div>

                    <ExternalLink
                      size={15}
                      className="text-slate-700 transition-colors group-hover:text-blue-400"
                    />
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-white">
                    {link.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {link.description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq-section" className="mt-14 scroll-mt-28">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
                Frequently Asked Questions
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Common questions
              </h2>
            </div>

            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
              }}
              className="w-fit rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              View all questions
            </button>
          </div>

          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <motion.article
                  key={faq.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(index * 0.04, 0.2),
                  }}
                  className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition-all hover:border-blue-400/15 hover:bg-white/[0.04] sm:p-7"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                      <HelpCircle className="h-5 w-5 text-blue-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-white sm:text-lg">
                        {faq.question}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-slate-400">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
                  <Search className="h-6 w-6 text-slate-600" />
                </div>

                <h3 className="mt-5 font-bold text-white">
                  No results found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  We couldn't find an answer matching your search. Try using
                  different keywords or browse another help category.
                </p>

                <button
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("all");
                  }}
                  className="mt-5 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Contact Support */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mt-14 overflow-hidden rounded-[2rem] border border-blue-400/15 bg-gradient-to-br from-blue-500/[0.09] to-cyan-500/[0.03] p-7 sm:p-10"
        >
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
                <MessageCircle className="h-6 w-6 text-blue-400" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
                  Still need help?
                </p>

                <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                  Can't find what you're looking for?
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-7 text-slate-400">
                  If you couldn't find the answer in our Help Center, reach out
                  through the contact page and provide details about the issue
                  you're experiencing.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/contact")}
              className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400"
            >
              <Mail size={17} />
              Contact Support
              <ExternalLink
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </motion.section>

        {/* Helpful Notice */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

          <p className="text-xs leading-6 text-slate-500">
            For important academic, admission, examination, payment, or
            institutional information, always verify details with the
            appropriate official institution or service provider.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
                        <img src={cogLogo} alt="Logo" className="h-6 w-6 object-contain" />
                   <div>
            <p className="text-sm font-semibold text-white">
              Help Center
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Find answers and get the support you need.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500">
            <button
              onClick={() => navigate("/terms")}
              className="transition hover:text-white"
            >
              Terms
            </button>

            <button
              onClick={() => navigate("/privacy")}
              className="transition hover:text-white"
            >
              Privacy
            </button>

            <button
              onClick={() => navigate("/contact")}
              className="transition hover:text-white"
            >
              Contact
            </button>
          </div>
        </div>
        </div>
      </footer>
    </div>
  );
};

export default Help;