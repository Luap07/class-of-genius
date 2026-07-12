import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  BookOpen,
  GraduationCap,
  CreditCard,
  User,
  Wrench,
  Bot,
  FlaskConical,
  Award,
  ChevronRight,
  ChevronDown,
  MessageSquare,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import Cog from "../../assets/cog.png";

const categories = [
  {
    title: "Courses",
    description: "Enrollments, lessons and certificates",
    icon: BookOpen,
    articles: 24,
  },
  {
    title: "Instructors",
    description: "Teaching and course creation",
    icon: GraduationCap,
    articles: 16,
  },
  {
    title: "Billing",
    description: "Payments, refunds and invoices",
    icon: CreditCard,
    articles: 12,
  },
  {
    title: "Account",
    description: "Profile, security and settings",
    icon: User,
    articles: 18,
  },
  {
    title: "Technical",
    description: "Fix platform issues",
    icon: Wrench,
    articles: 21,
  },
  {
    title: "AI Tutor",
    description: "Using AI features",
    icon: Bot,
    articles: 14,
  },
  {
    title: "Virtual Labs",
    description: "Interactive simulations",
    icon: FlaskConical,
    articles: 9,
  },
  {
    title: "Certificates",
    description: "Download & verification",
    icon: Award,
    articles: 7,
  },
];

const popularArticles = [
  "How to reset your password",
  "How to become an instructor",
  "How to publish your first course",
  "Downloading course certificates",
  "Troubleshooting payment issues",
  "Using the AI Tutor",
  "Joining live classes",
  "Managing your profile",
];

const HelpCenter = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const filteredArticles = useMemo(() => {
    return popularArticles.filter((article) =>
      article.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="flex items-center gap-4">

            <img
              src={Cog}
              alt="Scholiqen"
              className="h-12 w-12"
            />

            <div>

              <h1 className="text-2xl font-black">
                Scholiqen
              </h1>

              <p className="text-xs text-slate-400">
                Help Center
              </p>

            </div>

          </div>

          <div className="rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm font-semibold text-blue-400">
            Knowledge Base
          </div>

        </div>

      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">

        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
        >

          <div className="rounded-[36px] border border-slate-800 bg-slate-900 p-10 text-center">

            <h1 className="text-5xl font-black">
              Help Center
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-400">
              Find answers, browse guides, and learn everything
              you need to get the most out of Scholiqen.
            </p>

            <div className="mx-auto mt-10 max-w-3xl">

              <div className="flex items-center gap-4 rounded-2xl border-2 border-slate-700 bg-slate-950 px-5 py-4 focus-within:border-blue-500">

                <Search
                  size={22}
                  className="text-slate-500"
                />

                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none"
                />

              </div>

            </div>

          </div>
                    {/* ================= BROWSE CATEGORIES ================= */}

          <section className="mt-14">

            <div className="mb-8 flex items-center justify-between">

              <div>

                <h2 className="text-3xl font-black">
                  Browse by Category
                </h2>

                <p className="mt-2 text-slate-400">
                  Find help based on the topic you're looking for.
                </p>

              </div>

            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

              {categories.map((category, index) => {

                const Icon = category.icon;

                return (

                  <motion.div
                    key={category.title}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: index * 0.05,
                    }}
                    viewport={{ once: true }}
                    whileHover={{
                      y: -6,
                    }}
                    className="
                      group
                      cursor-pointer
                      rounded-[28px]
                      border
                      border-slate-800
                      bg-slate-900
                      p-7
                      transition-all
                      hover:border-blue-500/40
                      hover:shadow-[0_0_40px_rgba(59,130,246,0.12)]
                    "
                  >

                    <div className="flex items-center justify-between">

                      <div className="rounded-2xl bg-blue-500/10 p-4 transition group-hover:bg-blue-500/20">

                        <Icon
                          size={30}
                          className="text-blue-500"
                        />

                      </div>

                      <ChevronRight
                        size={20}
                        className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-blue-400"
                      />

                    </div>

                    <h3 className="mt-8 text-xl font-bold">
                      {category.title}
                    </h3>

                    <p className="mt-3 leading-7 text-slate-400">
                      {category.description}
                    </p>

                    <div className="mt-8 flex items-center justify-between">

                      <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-300">
                        {category.articles} Articles
                      </span>

                      <span className="text-sm font-semibold text-blue-400">
                        Explore
                      </span>

                    </div>

                  </motion.div>

                );

              })}

            </div>

          </section>





          {/* ================= POPULAR ARTICLES ================= */}

          <section className="mt-20">

            <div className="mb-8">

              <h2 className="text-3xl font-black">
                Popular Articles
              </h2>

              <p className="mt-2 text-slate-400">
                The guides our learners and instructors read the most.
              </p>

            </div>

            <div className="grid gap-5 lg:grid-cols-2">

              {filteredArticles.map((article, index) => (

                <motion.div
                  key={article}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                  }}
                  viewport={{ once: true }}
                  whileHover={{
                    x: 6,
                  }}
                  className="
                    flex
                    cursor-pointer
                    items-center
                    justify-between
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-900
                    p-6
                    transition-all
                    hover:border-blue-500/40
                  "
                >

                  <div className="flex items-center gap-4">

                    <div className="rounded-xl bg-blue-500/10 p-3">

                      <BookOpen
                        size={20}
                        className="text-blue-500"
                      />

                    </div>

                    <div>

                      <h3 className="font-semibold">
                        {article}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        Read article
                      </p>

                    </div>

                  </div>

                  <ChevronRight
                    className="text-slate-500"
                    size={20}
                  />

                </motion.div>

              ))}

              {filteredArticles.length === 0 && (

                <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

                  <Search
                    size={40}
                    className="mx-auto text-slate-500"
                  />

                  <h3 className="mt-5 text-xl font-bold">
                    No articles found
                  </h3>

                  <p className="mt-2 text-slate-400">
                    Try another keyword or browse the categories above.
                  </p>

                </div>

              )}

            </div>

          </section>
                    {/* ================= FAQ ================= */}

          <section className="mt-20">

            <div className="mb-8">

              <h2 className="text-3xl font-black">
                Frequently Asked Questions
              </h2>

              <p className="mt-2 text-slate-400">
                Quick answers to the questions we receive most often.
              </p>

            </div>

            <div className="space-y-5">

              <FAQItem
                question="How do I enroll in a course?"
                answer="Open the course page and click the Enroll button. Free courses are added instantly, while paid courses require successful payment before access is granted."
              />

              <FAQItem
                question="Can I become a Scholiqen instructor?"
                answer="Yes. Navigate to Become an Instructor from your dashboard, complete the application form, and submit your credentials for review."
              />

              <FAQItem
                question="How do I reset my password?"
                answer="Go to the Login page and click 'Forgot Password'. We'll send a password reset link to your registered email address."
              />

              <FAQItem
                question="How do I download my certificate?"
                answer="After completing all course requirements, visit your Certificates page and download your certificate in PDF format."
              />

              <FAQItem
                question="What payment methods are supported?"
                answer="Scholiqen supports secure online payment methods. Available options may vary depending on your country and region."
              />

              <FAQItem
                question="How can I report a bug?"
                answer="Visit the Report Issue page from the Support Center and provide detailed information along with screenshots if possible."
              />

            </div>

          </section>





          {/* ================= STILL NEED HELP ================= */}

          <section className="mt-24">

            <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-10">

              <div className="text-center">

                <h2 className="text-4xl font-black">
                  Still Need Help?
                </h2>

                <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
                  If you couldn't find what you're looking for,
                  our support team is always ready to assist you.
                </p>

              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

                <SupportCard
                  icon={<MessageSquare size={26} />}
                  title="Contact Support"
                  description="Talk directly with our support team."
                  path="/support/contact"
                />

                <SupportCard
                  icon={<Wrench size={26} />}
                  title="Report Issue"
                  description="Report bugs or technical problems."
                  path="/support/report"
                />

                <SupportCard
                  icon={<BookOpen size={26} />}
                  title="Instructor Support"
                  description="Dedicated help for instructors."
                  path="/support/instructor"
                />

                <SupportCard
                  icon={<Bot size={26} />}
                  title="Feature Request"
                  description="Suggest new features for Scholiqen."
                  path="/support/feature-request"
                />

              </div>

            </div>

          </section>
                  </motion.section>
      </main>
    </div>
  );
};

/* ================= FAQ ITEM ================= */

const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      layout
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
      "
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          flex
          w-full
          items-center
          justify-between
          px-6
          py-5
          text-left
        "
      >
        <span className="text-lg font-semibold">
          {question}
        </span>

        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronDown
            size={20}
            className="text-blue-400"
          />
        </motion.div>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="
            border-t
            border-slate-800
            px-6
            py-5
          "
        >
          <p className="leading-7 text-slate-400">
            {answer}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

/* ================= SUPPORT CARD ================= */

const SupportCard = ({
  icon,
  title,
  description,
  path,
}) => {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={() => navigate(path)}
      className="
        rounded-2xl
        border
        border-slate-800
        bg-slate-950
        p-6
        text-left
        transition-all
        hover:border-blue-500/40
        hover:shadow-[0_0_35px_rgba(59,130,246,0.12)]
      "
    >
      <div className="mb-5 inline-flex rounded-xl bg-blue-500/10 p-4 text-blue-500">
        {icon}
      </div>

      <h3 className="text-lg font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <div className="mt-6 flex items-center gap-2 font-semibold text-blue-400">
        Open
        <ChevronRight size={18} />
      </div>
    </motion.button>
  );
};

export default HelpCenter;