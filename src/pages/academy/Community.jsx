import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Globe2,
  GraduationCap,
  Heart,
  Lightbulb,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  PenLine,
  Plus,
  Search,
  Send,
  Sparkles,
  Users,
  Video,
  X,
} from "lucide-react";

import Cog from "../../assets/cog.png";
import heroImage from "../../assets/herocomm.jpg";

/* =========================================================
   COMMUNITY IMAGES
========================================================= */

const COMMUNITY_IMAGES = {
  study:
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85",

  mathematics:
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1400&q=85",

  science:
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1400&q=85",

  language:
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=85",

  exam:
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&q=85",

  students:
    "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1400&q=85",

  collaboration:
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=85",

  online:
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=85",
};

/* =========================================================
   COMMUNITY SPACES
========================================================= */

const COMMUNITY_SPACES = [
  {
    id: "general",
    title: "General Study Hub",
    description:
      "A welcoming space for students to discuss schoolwork, share ideas, ask questions and study together.",
    image: COMMUNITY_IMAGES.study,
    icon: Users,
    gradient: "from-cyan-400 to-blue-500",
    tag: "Student Community",
  },
  {
    id: "mathematics",
    title: "Mathematics Community",
    description:
      "Work through difficult problems, compare solutions and help other learners understand Mathematics.",
    image: COMMUNITY_IMAGES.mathematics,
    icon: Lightbulb,
    gradient: "from-violet-400 to-indigo-500",
    tag: "Mathematics",
  },
  {
    id: "science",
    title: "Science Community",
    description:
      "Explore Biology, Chemistry and Physics with other students through questions, experiments and discussions.",
    image: COMMUNITY_IMAGES.science,
    icon: Sparkles,
    gradient: "from-emerald-400 to-cyan-500",
    tag: "Science",
  },
  {
    id: "languages",
    title: "English & Languages",
    description:
      "Improve communication, vocabulary, grammar, writing and comprehension while learning with others.",
    image: COMMUNITY_IMAGES.language,
    icon: BookOpen,
    gradient: "from-amber-400 to-orange-500",
    tag: "Languages",
  },
  {
    id: "exam",
    title: "Exam Preparation",
    description:
      "Prepare for examinations together, exchange revision strategies and stay motivated throughout your study journey.",
    image: COMMUNITY_IMAGES.exam,
    icon: GraduationCap,
    gradient: "from-rose-400 to-pink-500",
    tag: "Exam Prep",
  },
  {
    id: "student",
    title: "Student Corner",
    description:
      "Connect with fellow students, share experiences, discover useful study methods and make new friends.",
    image: COMMUNITY_IMAGES.students,
    icon: Heart,
    gradient: "from-pink-400 to-purple-500",
    tag: "Students",
  },
];

/* =========================================================
   DISCUSSIONS
========================================================= */

const INITIAL_DISCUSSIONS = [
  {
    id: 1,
    name: "Daniel",
    role: "Senior Secondary",
    avatar: "D",
    subject: "Mathematics",
    time: "12 min ago",
    title: "How do I understand quadratic equations better?",
    body:
      "I've been practising quadratic equations but I still get confused when choosing which method to use. Does anyone have a simple way of knowing when to use factorisation or the quadratic formula?",
    likes: 18,
    replies: 7,
    liked: false,
  },
  {
    id: 2,
    name: "Amara",
    role: "Junior Secondary",
    avatar: "A",
    subject: "Biology",
    time: "34 min ago",
    title: "What is the easiest way to remember the parts of a cell?",
    body:
      "I'm revising cell structure today. If anyone has a good memory trick or study method for remembering the functions of the organelles, please share.",
    likes: 24,
    replies: 11,
    liked: false,
  },
  {
    id: 3,
    name: "Michael",
    role: "Senior Secondary",
    avatar: "M",
    subject: "Physics",
    time: "1 hr ago",
    title: "Let's solve this motion problem together",
    body:
      "I found an interesting motion question and thought it would be useful for everyone preparing for exams. I'll post the question below. Let's compare our working.",
    likes: 31,
    replies: 14,
    liked: false,
  },
];

/* =========================================================
   STUDY GROUPS
========================================================= */

const STUDY_GROUPS = [
  {
    title: "Morning Study Circle",
    description:
      "A focused study space for learners who want to start their day with productive revision.",
    image: COMMUNITY_IMAGES.online,
    icon: Clock3,
    gradient: "from-cyan-400 to-blue-500",
    schedule: "Weekdays • Morning",
  },
  {
    title: "Science Explorers",
    description:
      "Discuss Biology, Chemistry and Physics topics, practicals and challenging questions together.",
    image: COMMUNITY_IMAGES.science,
    icon: Sparkles,
    gradient: "from-emerald-400 to-teal-500",
    schedule: "Weekly Sessions",
  },
  {
    title: "Exam Warriors",
    description:
      "A focused preparation group for learners working toward important examinations and assessments.",
    image: COMMUNITY_IMAGES.exam,
    icon: GraduationCap,
    gradient: "from-violet-400 to-purple-500",
    schedule: "Revision Sessions",
  },
];

/* =========================================================
   EVENTS
========================================================= */

const EVENTS = [
  {
    title: "Community Study Session",
    description:
      "Bring your questions and study together with other Scholiqen learners.",
    date: "Saturday",
    time: "4:00 PM",
    icon: BookOpen,
  },
  {
    title: "Mathematics Problem Solving",
    description:
      "Work through challenging Mathematics problems with fellow students.",
    date: "Wednesday",
    time: "5:30 PM",
    icon: Lightbulb,
  },
  {
    title: "Science Discussion",
    description:
      "Explore interesting scientific concepts and practical questions.",
    date: "Friday",
    time: "6:00 PM",
    icon: Sparkles,
  },
];

/* =========================================================
   IMAGE COMPONENT
========================================================= */

function CommunityImage({
  src,
  alt,
  className = "",
  fallbackText = "Scholiqen Community",
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!failed ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950">
          <div className="text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-cyan-300" />
            <p className="text-sm font-semibold text-white">
              {fallbackText}
            </p>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
    </div>
  );
}

/* =========================================================
   NAVBAR
========================================================= */

function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="mx-auto max-w-7xl">
        <nav className="flex h-[70px] items-center justify-between rounded-2xl border border-white/10 bg-slate-950/75 px-4 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:px-6">
          <Link to="/academy" className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-cyan-400/20 bg-slate-900">
              <img
                src={Cog}
                alt="Scholiqen"
                className="h-full w-full object-contain p-1"
              />
            </div>

            <div className="hidden sm:block">
              <div className="text-[15px] font-black tracking-wide text-white">
                SCHOLIQEN
              </div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.25em] text-cyan-300">
                Academy
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {[
              ["Academy", "/academy"],
              ["Academics", "/academics"],
              ["Resources", "/resources"],
              ["Community", "/community"],
              ["OurStory", "/our-story"],
            ].map(([label, href]) => (
              <Link
                key={label}
                to={href}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  label === "Community"
                    ? "bg-cyan-400/10 text-cyan-300"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/academy/sign-in"
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:block"
            >
              Sign In
            </Link>

            <Link
              to="/academy/student-enrollment-login"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]"
            >
              Join
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

/* =========================================================
   HERO
========================================================= */

function Hero() {
  return (
    <section className="relative flex min-h-[720px] items-center overflow-hidden bg-slate-950 pt-28">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Scholiqen learning community"
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-slate-950/65" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30" />
      </div>

      <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#67e8f9_1px,transparent_1px)] [background-size:26px_26px]" />

      <motion.div
        className="absolute right-[8%] top-[25%] h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 backdrop-blur-md"
          >
            <Users className="h-4 w-4 text-cyan-300" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
              Scholiqen Community
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl font-black leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-8xl"
          >
            Learn together.
            <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Grow together.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg"
          >
            Connect with fellow learners, ask questions, join study groups,
            exchange ideas and build your academic journey with a community
            that learns alongside you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to="/academy/sign-in"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-4 font-black text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:scale-[1.02]"
            >
              Join the Community
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>

            <a
              href="#spaces"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-bold text-white backdrop-blur-xl transition hover:bg-white/10"
            >
              Explore Spaces
              <ChevronRight className="h-5 w-5" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   INTRO
========================================================= */

function Intro() {
  return (
    <section className="relative overflow-hidden bg-slate-950 px-5 py-24 sm:px-8 lg:px-10">
      <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#67e8f9_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
            <Sparkles className="h-4 w-4" />
            More than a classroom
          </div>

          <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Your learning journey is better with{" "}
            <span className="text-cyan-300">people around you.</span>
          </h2>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-400">
            Scholiqen Community gives learners a place to ask, answer,
            collaborate and stay motivated. Whether you're stuck on a
            Mathematics problem or preparing for an examination, you don't
            have to learn alone.
          </p>

          <div className="mt-8 space-y-4">
            {[
              "Ask questions and get help from fellow learners.",
              "Join subject-focused communities.",
              "Create or join focused study groups.",
              "Share useful learning resources and ideas.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                <span className="text-sm leading-6 text-slate-300">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="absolute -inset-5 rounded-[2rem] bg-cyan-500/10 blur-3xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-2 shadow-2xl">
            <CommunityImage
              src={COMMUNITY_IMAGES.collaboration}
              alt="Students collaborating"
              className="h-[360px] rounded-[1.5rem] sm:h-[430px]"
              fallbackText="Learn Together"
            />

            <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/10 bg-slate-950/80 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
                  <MessageCircle className="h-5 w-5 text-cyan-300" />
                </div>

                <div>
                  <p className="font-bold text-white">
                    Ask. Share. Collaborate.
                  </p>
                  <p className="text-xs text-slate-400">
                    Build knowledge together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* =========================================================
   COMMUNITY SPACES
========================================================= */

function CommunitySpaces() {
  return (
    <section
      id="spaces"
      className="relative bg-slate-950 px-5 py-24 sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
            Find your space
          </p>

          <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Communities built around learning.
          </h2>

          <p className="mt-5 leading-7 text-slate-400">
            Find a space that matches what you're learning, preparing for or
            interested in.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {COMMUNITY_SPACES.map((space, index) => {
            const Icon = space.icon;

            return (
              <motion.div
                key={space.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.06,
                }}
                whileHover={{ y: -7 }}
                className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] shadow-xl shadow-black/20"
              >
                <CommunityImage
                  src={space.image}
                  alt={space.title}
                  className="h-52"
                  fallbackText={space.title}
                />

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${space.gradient} bg-opacity-20`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {space.tag}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-black text-white">
                    {space.title}
                  </h3>

                  <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-400">
                    {space.description}
                  </p>

                  <button
                    type="button"
                    className="group/btn mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-300"
                  >
                    Explore community
                    <ArrowRight className="h-4 w-4 transition group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ASK COMMUNITY
========================================================= */

function AskCommunity({ onAsk }) {
  return (
    <section className="relative overflow-hidden bg-slate-950 px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.08] via-blue-500/[0.05] to-transparent p-6 sm:p-8 lg:p-10"
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">
                <MessageSquare className="h-4 w-4" />
                Ask the community
              </div>

              <h3 className="text-2xl font-black text-white sm:text-3xl">
                Stuck on something?
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Ask a question and learn from students who may have faced the
                same challenge.
              </p>
            </div>

            <button
              type="button"
              onClick={onAsk}
              className="group inline-flex shrink-0 items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 transition hover:scale-[1.02]"
            >
              Ask a Question
              <Plus className="h-4 w-4 transition group-hover:rotate-90" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* =========================================================
   DISCUSSION FEED
========================================================= */

function DiscussionFeed({ discussions, setDiscussions }) {
  const toggleLike = (id) => {
    setDiscussions((current) =>
      current.map((post) =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  return (
    <section className="bg-slate-950 px-5 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_350px]">
        <div>
          <div className="mb-8 flex items-end justify-between gap-5">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
                Community discussions
              </p>

              <h2 className="text-3xl font-black text-white sm:text-4xl">
                What learners are talking about
              </h2>
            </div>

            <button
              type="button"
              className="hidden items-center gap-1 text-sm font-bold text-cyan-300 sm:flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-5">
            {discussions.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.07,
                }}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 font-black text-slate-950">
                      {post.avatar}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {post.name}
                        </span>

                        <span className="text-xs text-slate-500">
                          • {post.role}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span>{post.time}</span>
                        <span>•</span>
                        <span className="text-cyan-400/80">
                          {post.subject}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>

                <h3 className="mt-5 text-lg font-black text-white">
                  {post.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {post.body}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
                  <button
                    type="button"
                    onClick={() => toggleLike(post.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
                      post.liked
                        ? "bg-pink-400/10 text-pink-300"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${post.liked ? "fill-current" : ""}`}
                    />
                    {post.likes}
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-slate-400 transition hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {post.replies} replies
                  </button>

                  <button
                    type="button"
                    className="ml-auto inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-cyan-400/10 hover:text-cyan-300"
                  >
                    Join discussion
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <aside>
          <div className="sticky top-28 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035]">
            <CommunityImage
              src={COMMUNITY_IMAGES.students}
              alt="Students learning together"
              className="h-48"
              fallbackText="Student Community"
            />

            <div className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
                <Users className="h-5 w-5 text-cyan-300" />
              </div>

              <h3 className="mt-5 text-xl font-black text-white">
                Be part of the conversation.
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Share what you've learned, help someone understand a topic and
                discover new ways to study.
              </p>

              <Link
                to="/academy/sign-in"
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 font-black text-slate-950"
              >
                Join Scholiqen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

/* =========================================================
   STUDY GROUPS
========================================================= */

function StudyGroups() {
  return (
    <section className="relative overflow-hidden bg-[#030712] px-5 py-24 sm:px-8 lg:px-10">
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
              Study groups
            </p>

            <h2 className="text-4xl font-black text-white">
              Find people who study like you.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              Join focused groups where learners can stay accountable,
              exchange ideas and make consistent progress.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-bold text-cyan-300"
          >
            Explore groups
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {STUDY_GROUPS.map((group, index) => {
            const Icon = group.icon;

            return (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.08,
                }}
                whileHover={{ y: -6 }}
                className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035]"
              >
                <CommunityImage
                  src={group.image}
                  alt={group.title}
                  className="h-56"
                  fallbackText={group.title}
                />

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                      <Icon className="h-5 w-5 text-cyan-300" />
                    </div>

                    <span className="text-xs font-semibold text-slate-500">
                      {group.schedule}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-black text-white">
                    {group.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {group.description}
                  </p>

                  <button
                    type="button"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-300"
                  >
                    Join study group
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   EVENTS
========================================================= */

function CommunityEvents() {
  return (
    <section className="bg-slate-950 px-5 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
            Community activities
          </p>

          <h2 className="text-4xl font-black text-white">
            Learn beyond the textbook.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {EVENTS.map((event, index) => {
            const Icon = event.icon;

            return (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.07,
                }}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10">
                    <Icon className="h-5 w-5 text-cyan-300" />
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                    <p className="text-xs font-bold text-cyan-300">
                      {event.date}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {event.time}
                    </p>
                  </div>
                </div>

                <h3 className="mt-6 text-lg font-black text-white">
                  {event.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {event.description}
                </p>

                <button
                  type="button"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-300"
                >
                  Learn more
                  <ChevronRight className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   COLLABORATION
========================================================= */

function Collaboration() {
  return (
    <section className="bg-[#030712] px-5 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] lg:grid-cols-2">
        <div className="relative min-h-[380px]">
          <CommunityImage
            src={COMMUNITY_IMAGES.collaboration}
            alt="Students collaborating"
            className="absolute inset-0"
            fallbackText="Student Collaboration"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950/50" />
        </div>

        <div className="flex items-center p-8 sm:p-12">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-300">
              <Globe2 className="h-3.5 w-3.5" />
              Collaboration
            </div>

            <h2 className="text-4xl font-black tracking-tight text-white">
              Your next great idea could start with a conversation.
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-400">
              Learning isn't only about consuming information. Discuss
              concepts, challenge ideas, work on projects and help other
              learners see a topic from a different perspective.
            </p>

            <div className="mt-7 space-y-4">
              {[
                "Discuss difficult topics",
                "Share useful study methods",
                "Work together on learning projects",
                "Support other students",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/10">
                    <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                  </div>

                  <span className="text-sm font-medium text-slate-300">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <Link
              to="/academy/student-enrollment-login"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 transition hover:scale-[1.02]"
            >
              Start connecting
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ASK MODAL
========================================================= */

function AskQuestionModal({ open, onClose }) {
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState("General");

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 25, scale: 0.97 }}
          className="w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div>
              <div className="flex items-center gap-2 text-cyan-300">
                <PenLine className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-[0.18em]">
                  Ask the community
                </span>
              </div>

              <h3 className="mt-2 text-xl font-black text-white">
                What would you like to ask?
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Subject
              </label>

              <select
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
              >
                <option className="bg-slate-950">General</option>
                <option className="bg-slate-950">Mathematics</option>
                <option className="bg-slate-950">English Language</option>
                <option className="bg-slate-950">Biology</option>
                <option className="bg-slate-950">Chemistry</option>
                <option className="bg-slate-950">Physics</option>
                <option className="bg-slate-950">Computer Studies</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Your question
              </label>

              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={6}
                placeholder="Explain what you're finding difficult..."
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 transition focus:border-cyan-400/40"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!question.trim()}
                onClick={() => {
                  onClose();
                  setQuestion("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Post Question
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* =========================================================
   FINAL CTA
========================================================= */

function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-slate-950 px-5 py-28 sm:px-8 lg:px-10">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.04] via-cyan-500/[0.05] to-transparent" />

      <motion.div
        className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[120px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.55, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
          <Users className="h-6 w-6 text-cyan-300" />
        </div>

        <h2 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
          Don't learn alone.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400">
          Join Scholiqen and become part of a learning community where
          questions become conversations, conversations become knowledge and
          knowledge becomes progress.
        </p>

        <Link
          to="/academy/student-enrollment-login"
          className="group mt-9 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-4 font-black text-slate-950 shadow-2xl shadow-cyan-500/20 transition hover:scale-[1.03]"
        >
          Join Scholiqen Community
          <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}

/* =========================================================
   FOOTER
========================================================= */

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#020617] px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/academy" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                <img
                  src={Cog}
                  alt="Scholiqen"
                  className="h-full w-full object-contain p-1"
                />
              </div>

              <div>
                <div className="font-black tracking-wide text-white">
                  SCHOLIQEN
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                  Academy
                </div>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
              A modern learning platform designed to help students learn,
              practise, collaborate and grow.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">Explore</h4>

            <div className="mt-4 space-y-3">
              <Link
                to="/academics"
                className="block text-sm text-slate-500 transition hover:text-cyan-300"
              >
                Academics
              </Link>

              <Link
                to="/resources"
                className="block text-sm text-slate-500 transition hover:text-cyan-300"
              >
                Resources
              </Link>

              <Link
                to="/virtual-lab"
                className="block text-sm text-slate-500 transition hover:text-cyan-300"
              >
                Virtual Laboratory
              </Link>

              <Link
                to="/cbt"
                className="block text-sm text-slate-500 transition hover:text-cyan-300"
              >
                CBT Practice
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">Community</h4>

            <div className="mt-4 space-y-3">
              <a
                href="#spaces"
                className="block text-sm text-slate-500 transition hover:text-cyan-300"
              >
                Community Spaces
              </a>

              <a
                href="#"
                className="block text-sm text-slate-500 transition hover:text-cyan-300"
              >
                Study Groups
              </a>

              <a
                href="#"
                className="block text-sm text-slate-500 transition hover:text-cyan-300"
              >
                Discussions
              </a>

              <Link
                to="/academy/student-enrollment-login"
                className="block text-sm text-slate-500 transition hover:text-cyan-300"
              >
                Join Community
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/5 pt-6 text-xs text-slate-600 sm:flex-row">
          <p>© {new Date().getFullYear()} Scholiqen Academy.</p>
          <p>Learn • Practise • Collaborate • Grow</p>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Community() {
  const [discussions, setDiscussions] = useState(INITIAL_DISCUSSIONS);
  const [askOpen, setAskOpen] = useState(false);

  const pageBackground = useMemo(
    () => "min-h-screen overflow-x-hidden bg-slate-950 text-white",
    []
  );

  return (
    <div className={pageBackground}>
      <Navbar />

      <main>
        <Hero />

        <Intro />

        <CommunitySpaces />

        <AskCommunity onAsk={() => setAskOpen(true)} />

        <DiscussionFeed
          discussions={discussions}
          setDiscussions={setDiscussions}
        />

        <StudyGroups />

        <CommunityEvents />

        <Collaboration />

        <FinalCTA />
      </main>

      <Footer />

      <AskQuestionModal
        open={askOpen}
        onClose={() => setAskOpen(false)}
      />
    </div>
  );
}