import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  MessageCircle,
  BookOpen,
  Trophy,
  Calendar,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cog from "../../assets/cog.png";

const communityFeatures = [
  {
    icon: MessageCircle,
    title: "Discussion Forums",
    description:
      "Ask questions, share ideas and connect with students and instructors.",
  },
  {
    icon: BookOpen,
    title: "Study Groups",
    description:
      "Join subject-based study groups and prepare together.",
  },
  {
    icon: Trophy,
    title: "Top Contributors",
    description:
      "Earn points, badges and recognition for helping others.",
  },
  {
    icon: Calendar,
    title: "Events & Webinars",
    description:
      "Attend live sessions, coding events and workshops.",
  },
];

const Community = () => {
  const navigate = useNavigate();

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
                Community Hub
              </p>

            </div>

          </div>

          <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold transition hover:bg-blue-700">
            Join Community
          </button>

        </div>

      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* ================= HERO ================= */}

        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[36px] border border-slate-800 bg-slate-900 p-10"
        >

          <div className="grid items-center gap-10 lg:grid-cols-2">

            <div>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">

                <Users size={18} />

                Community Hub

              </div>

              <h1 className="text-5xl font-black leading-tight">
                Learn.
                <span className="text-blue-500"> Collaborate.</span>
                Grow Together.
              </h1>

              <p className="mt-6 max-w-2xl leading-8 text-slate-400">
                Join thousands of learners, educators and professionals sharing
                knowledge, solving problems and building amazing careers
                together.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">

                <button className="rounded-2xl bg-blue-600 px-7 py-4 font-bold transition hover:bg-blue-700">
                  Join Now
                </button>

                <button className="rounded-2xl border border-slate-700 px-7 py-4 font-semibold transition hover:border-blue-500">
                  Explore Groups
                </button>

              </div>

            </div>

            <div className="rounded-[30px] border border-slate-800 bg-slate-950 p-8">

              <div className="grid gap-6 sm:grid-cols-2">

                <StatCard
                  value="25K+"
                  label="Community Members"
                />

                <StatCard
                  value="320+"
                  label="Study Groups"
                />

                <StatCard
                  value="150+"
                  label="Weekly Discussions"
                />

                <StatCard
                  value="98%"
                  label="Helpful Answers"
                />

              </div>

            </div>

          </div>

        </motion.section>

        {/* ================= FEATURES ================= */}

        <section className="mt-12">

          <div className="mb-8">

            <h2 className="text-3xl font-black">
              Explore the Community
            </h2>

            <p className="mt-3 text-slate-400">
              Everything you need to collaborate and learn together.
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-2">
                        {communityFeatures.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -6 }}
                  className="rounded-[28px] border border-slate-800 bg-slate-900 p-7 transition-all hover:border-blue-500/40"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
                    <Icon className="text-blue-500" size={28} />
                  </div>

                  <h3 className="mt-6 text-2xl font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-400">
                    {feature.description}
                  </p>

                  <button className="mt-8 flex items-center gap-2 font-semibold text-blue-400 transition hover:gap-3">
                    Explore
                    <ChevronRight size={18} />
                  </button>
                </motion.div>
              );
            })}
          </div>

        </section>





        {/* ================= COMMUNITY HIGHLIGHTS ================= */}

        <section className="mt-16">

          <div className="mb-8">

            <h2 className="text-3xl font-black">
              Community Highlights
            </h2>

            <p className="mt-3 text-slate-400">
              See what's happening across Scholiqen this week.
            </p>

          </div>

          <div className="grid gap-6 lg:grid-cols-3">

            <HighlightCard
              title="🔥 Trending Discussions"
              text="Explore the hottest conversations from students and instructors."
            />

            <HighlightCard
              title="🎓 New Study Groups"
              text="Find groups for WAEC, JAMB, Coding, AI, Mathematics and more."
            />

            <HighlightCard
              title="🚀 Weekly Challenges"
              text="Participate in quizzes and coding challenges to earn rewards."
            />

          </div>

        </section>





        {/* ================= ACTIVE GROUPS ================= */}

        <section className="mt-16">

          <div className="mb-8">

            <h2 className="text-3xl font-black">
              Popular Study Groups
            </h2>

            <p className="mt-3 text-slate-400">
              Learn together with thousands of members.
            </p>

          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {[
              "Web Development",
              "Artificial Intelligence",
              "Cyber Security",
              "WAEC Preparation",
              "JAMB Preparation",
              "UI/UX Design",
            ].map((group) => (

              <motion.div
                key={group}
                whileHover={{ y: -5 }}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">

                    <Users
                      size={22}
                      className="text-blue-500"
                    />

                  </div>

                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                    Active
                  </span>

                </div>

                <h3 className="mt-5 text-xl font-bold">
                  {group}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Connect with learners, ask questions, share resources and
                  collaborate on projects.
                </p>

                <button className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold transition hover:bg-blue-700">
                  Join Group
                </button>

              </motion.div>

            ))}

          </div>

        </section>
                {/* ================= TOP CONTRIBUTORS ================= */}

        <section className="mt-16">

          <div className="mb-8">

            <h2 className="text-3xl font-black">
              Top Contributors
            </h2>

            <p className="mt-3 text-slate-400">
              Meet some of the members making the biggest impact in our community.
            </p>

          </div>

          <div className="space-y-5">

            {[
              {
                name: "John Doe",
                role: "Senior Instructor",
                points: "15,420 XP",
              },
              {
                name: "Sarah Johnson",
                role: "Community Mentor",
                points: "13,870 XP",
              },
              {
                name: "Michael Smith",
                role: "Top Student",
                points: "11,940 XP",
              },
              {
                name: "Emily Davis",
                role: "Course Creator",
                points: "10,775 XP",
              },
            ].map((user, index) => (

              <motion.div
                key={user.name}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 p-6"
              >

                <div className="flex items-center gap-5">

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-xl font-bold text-blue-400">
                    {index + 1}
                  </div>

                  <div>

                    <h3 className="text-lg font-bold">
                      {user.name}
                    </h3>

                    <p className="text-sm text-slate-400">
                      {user.role}
                    </p>

                  </div>

                </div>

                <div className="text-right">

                  <div className="flex items-center gap-2 font-bold text-yellow-400">

                    <Trophy size={18} />

                    {user.points}

                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Community Points
                  </p>

                </div>

              </motion.div>

            ))}

          </div>

        </section>





        {/* ================= UPCOMING EVENTS ================= */}

        <section className="mt-16">

          <div className="mb-8">

            <h2 className="text-3xl font-black">
              Upcoming Events
            </h2>

            <p className="mt-3 text-slate-400">
              Don't miss our live sessions and workshops.
            </p>

          </div>

          <div className="grid gap-6 lg:grid-cols-3">

            {[
              {
                title: "React Bootcamp",
                date: "12 Aug 2026",
              },
              {
                title: "AI Masterclass",
                date: "18 Aug 2026",
              },
              {
                title: "Community Q&A",
                date: "25 Aug 2026",
              },
            ].map((event) => (

              <motion.div
                key={event.title}
                whileHover={{ y: -6 }}
                className="rounded-3xl border border-slate-800 bg-slate-900 p-7"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">

                  <Calendar
                    size={28}
                    className="text-blue-500"
                  />

                </div>

                <h3 className="mt-6 text-2xl font-bold">
                  {event.title}
                </h3>

                <p className="mt-3 text-slate-400">
                  {event.date}
                </p>

                <button className="mt-8 w-full rounded-xl border border-blue-500 py-3 font-semibold text-blue-400 transition hover:bg-blue-500 hover:text-white">
                  Register
                </button>

              </motion.div>

            ))}

          </div>

        </section>





        {/* ================= LATEST DISCUSSIONS ================= */}

        <section className="mt-16">

          <div className="mb-8">

            <h2 className="text-3xl font-black">
              Latest Discussions
            </h2>

            <p className="mt-3 text-slate-400">
              Join conversations happening across the community.
            </p>

          </div>

          <div className="space-y-5">

            {[
              "How do I prepare effectively for JAMB?",
              "Best roadmap for learning React in 2026",
              "AI tools every student should know",
              "Share your latest coding project",
            ].map((topic) => (

              <motion.div
                key={topic}
                whileHover={{ x: 5 }}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >

                <div className="flex items-center gap-4">

                  <MessageCircle
                    className="text-blue-500"
                    size={24}
                  />

                  <span className="font-medium">
                    {topic}
                  </span>

                </div>

                <ChevronRight
                  size={20}
                  className="text-slate-500"
                />

              </motion.div>

            ))}

          </div>

        </section>
                {/* ================= COMMUNITY GUIDELINES ================= */}

        <section className="mt-16">

          <div className="mb-8">

            <h2 className="text-3xl font-black">
              Community Guidelines
            </h2>

            <p className="mt-3 text-slate-400">
              Help us keep Scholiqen welcoming, respectful, and productive for everyone.
            </p>

          </div>

          <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-8">

            <div className="grid gap-6 md:grid-cols-2">

              {[
                "Respect every community member.",
                "Share accurate and helpful information.",
                "Avoid spam, advertising, or harmful content.",
                "Keep discussions relevant and constructive.",
                "Report inappropriate behavior when necessary.",
                "Support learners with patience and kindness.",
              ].map((rule) => (

                <div
                  key={rule}
                  className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-5"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">

                    <ShieldCheck
                      size={20}
                      className="text-blue-500"
                    />

                  </div>

                  <p className="leading-7 text-slate-300">
                    {rule}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </section>





        {/* ================= JOIN CTA ================= */}

        <section className="mt-16">

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="overflow-hidden rounded-[36px] border border-blue-500/20 bg-gradient-to-r from-blue-600/20 via-slate-900 to-blue-600/20 p-10"
          >

            <div className="flex flex-col items-center text-center">

              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10">

                <Users
                  size={40}
                  className="text-blue-400"
                />

              </div>

              <h2 className="mt-8 text-4xl font-black">
                Join the Scholiqen Community
              </h2>

              <p className="mt-5 max-w-3xl leading-8 text-slate-300">
                Learn with thousands of students, collaborate with instructors,
                participate in live events, ask questions, and grow your skills
                with one of the fastest-growing learning communities.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-5">

                <button className="rounded-2xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-700">
                  Join Community
                </button>

                <button className="rounded-2xl border border-slate-700 px-8 py-4 font-semibold transition hover:border-blue-500 hover:text-blue-400">
                  Explore Discussions
                </button>

              </div>

            </div>

          </motion.div>

        </section>





        {/* ================= NEWSLETTER ================= */}

        <section className="mt-16">

          <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-8">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="text-3xl font-black">
                  Stay Updated
                </h2>

                <p className="mt-3 max-w-xl leading-7 text-slate-400">
                  Receive updates about webinars, new study groups,
                  competitions, community events and product releases.
                </p>

              </div>

              <div className="flex w-full max-w-xl gap-4">

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="
                    flex-1
                    rounded-xl
                    border-2
                    border-slate-700
                    bg-slate-950
                    px-5
                    py-4
                    text-white
                    placeholder:text-slate-500
                    outline-none
                    focus:border-blue-500
                  "
                />

                <button className="rounded-xl bg-blue-600 px-7 font-semibold transition hover:bg-blue-700">
                  Subscribe
                </button>

              </div>

            </div>

          </div>

        </section>
              </main>

    </div>
  );
};

/* ================= STAT CARD ================= */

const StatCard = ({ value, label }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">

    <h3 className="text-4xl font-black text-blue-400">
      {value}
    </h3>

    <p className="mt-3 text-sm text-slate-400">
      {label}
    </p>

  </div>
);

/* ================= HIGHLIGHT CARD ================= */

const HighlightCard = ({ title, text }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="rounded-[28px] border border-slate-800 bg-slate-900 p-7 transition-all hover:border-blue-500/40"
  >

    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">

      <MessageCircle
        size={28}
        className="text-blue-500"
      />

    </div>

    <h3 className="mt-6 text-2xl font-bold">
      {title}
    </h3>

    <p className="mt-3 leading-7 text-slate-400">
      {text}
    </p>

    <button className="mt-8 flex items-center gap-2 font-semibold text-blue-400 transition hover:gap-3">
      Learn More
      <ChevronRight size={18} />
    </button>

  </motion.div>
);

export default Community;