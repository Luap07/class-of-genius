import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Target,
  Star,
  Award,
  Languages,
  CheckCircle,
  Volume2,
} from "lucide-react";

const LanguageChallenges = () => {
  const [completed, setCompleted] = useState([]);

  const challenges = [
    { id: 1, title: "7 Day Speaking Challenge", description: "Speak for 5 minutes every day to improve confidence.", xp: 500, level: "Beginner", type: "Speaking" },
    { id: 2, title: "Vocabulary Builder", description: "Learn 20 new words and use them in sentences.", xp: 700, level: "Beginner", type: "Vocabulary" },
    { id: 3, title: "Listening Explorer", description: "Complete daily listening exercises for one week.", xp: 800, level: "Intermediate", type: "Listening" },
    { id: 4, title: "Grammar Master", description: "Complete grammar lessons and practice exercises.", xp: 1200, level: "Intermediate", type: "Grammar" },
    { id: 5, title: "Conversation Hero", description: "Hold a 10-minute conversation in your target language.", xp: 1500, level: "Advanced", type: "Speaking" },
    { id: 6, title: "Pronunciation Pro", description: "Practice difficult sounds and improve your accent.", xp: 900, level: "Intermediate", type: "Pronunciation" },
    { id: 7, title: "Travel Language Quest", description: "Learn 50 useful travel phrases.", xp: 1000, level: "Beginner", type: "Travel" },
    { id: 8, title: "Daily Journal Challenge", description: "Write a short diary entry in your new language.", xp: 1100, level: "Intermediate", type: "Writing" },
    { id: 9, title: "Native Speaker Mission", description: "Listen and repeat phrases from native speakers.", xp: 1300, level: "Advanced", type: "Speaking" },
    { id: 10, title: "Vocabulary Marathon", description: "Master 100 words in your chosen language.", xp: 2000, level: "Expert", type: "Vocabulary" },
    { id: 11, title: "Fluency Sprint", description: "Practice speaking every day for 7 days.", xp: 1800, level: "Advanced", type: "Speaking" },
    { id: 12, title: "Grammar Warrior", description: "Complete grammar exercises for a full week.", xp: 1600, level: "Advanced", type: "Grammar" },
    { id: 13, title: "Language Detective", description: "Discover meanings of 30 unknown words.", xp: 900, level: "Beginner", type: "Vocabulary" },
    { id: 14, title: "Culture Explorer", description: "Learn about traditions and expressions.", xp: 1000, level: "Intermediate", type: "Culture" },
    { id: 15, title: "Speed Learner", description: "Complete 5 lessons in 7 days.", xp: 1400, level: "Intermediate", type: "Learning" },
    { id: 16, title: "Accent Challenge", description: "Improve pronunciation with daily speaking drills.", xp: 1700, level: "Advanced", type: "Pronunciation" },
    { id: 17, title: "Movie Language Challenge", description: "Learn phrases from movies and shows.", xp: 1200, level: "Intermediate", type: "Listening" },
    { id: 18, title: "Business Language Pro", description: "Master professional workplace expressions.", xp: 2200, level: "Expert", type: "Business" },
    { id: 19, title: "Memory Champion", description: "Review flashcards and remember 200 words.", xp: 2500, level: "Expert", type: "Vocabulary" },
    { id: 20, title: "Global Conversation", description: "Practice conversations across different topics.", xp: 3000, level: "Expert", type: "Speaking" },
  ];

  const completeChallenge = (id) => {
    if (!completed.includes(id)) {
      setCompleted([...completed, id]);
    }
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="min-h-screen bg-[#020617] px-8 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        {/* ================= HERO ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-orange-600/20 via-red-600/20 to-purple-600/20 p-10"
        >
          <div className="flex items-center gap-5">
            <div className="rounded-2xl bg-orange-500/20 p-4">
              <Trophy size={42} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-5xl font-black">Language Challenges</h1>
              <p className="mt-3 max-w-3xl leading-8 text-slate-300">
                Complete daily missions, earn XP, build streaks and become fluent faster.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ================= CHALLENGE CARDS ================= */}
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-8">
            <Target className="text-red-400" />
            <h2 className="text-3xl font-black">Active Challenges</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {challenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                whileHover={{ y: -8 }}
                className="rounded-3xl border border-white/10 bg-slate-900 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-black">{challenge.title}</h3>
                      <p className="mt-3 leading-7 text-slate-400">{challenge.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speak(`${challenge.title}. ${challenge.description}`)}
                        className="rounded-xl bg-cyan-500/20 p-3 text-cyan-400 hover:bg-cyan-500/30 transition"
                        title="Listen to challenge"
                      >
                        <Volume2 size={18} />
                      </button>
                      <div className="rounded-xl bg-yellow-500/20 p-3">
                        <Star className="text-yellow-400" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="rounded-full bg-blue-500/20 px-4 py-2 text-sm text-blue-300">
                      {challenge.level}
                    </span>
                    <span className="font-black text-green-400">+{challenge.xp} XP</span>
                  </div>
                </div>

                <button
                  onClick={() => completeChallenge(challenge.id)}
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-black ${
                    completed.includes(challenge.id) ? "bg-green-600" : "bg-orange-600"
                  }`}
                >
                  {completed.includes(challenge.id) ? (
                    <>
                      <CheckCircle size={18} />
                      Completed
                    </>
                  ) : (
                    "Complete Challenge"
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= STREAK ================= */}
        <section className="mt-14">
          <motion.div whileHover={{ scale: 1.02 }} className="rounded-3xl border border-white/10 bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="rounded-2xl bg-orange-500/20 p-4">
                  <Flame size={40} className="text-orange-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-black">Learning Streak</h2>
                  <p className="mt-2 text-slate-300">Keep practicing every day to maintain your streak.</p>
                </div>
              </div>
              <div className="rounded-2xl bg-black/30 px-8 py-5 text-center">
                <p className="text-sm text-slate-400">Current Streak</p>
                <h3 className="text-4xl font-black">15 Days 🔥</h3>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ================= LEADERBOARD ================= */}
        <section className="mt-14 grid gap-6 md:grid-cols-2">
          <motion.div whileHover={{ y: -8 }} className="rounded-3xl border border-white/10 bg-slate-900 p-8">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-blue-500/20 p-4">
                <Languages size={35} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black">Global Learners</h3>
                <p className="mt-2 text-slate-400">Compare progress with language learners worldwide.</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {[
                { name: "Alex", xp: "12,500 XP" },
                { name: "Maria", xp: "10,800 XP" },
                { name: "You", xp: "8,500 XP" },
              ].map((user, index) => (
                <div key={index} className="flex items-center justify-between rounded-xl bg-black/30 p-4">
                  <span className="font-bold">#{index + 1} {user.name}</span>
                  <span className="text-cyan-400">{user.xp}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -8 }} className="rounded-3xl border border-white/10 bg-slate-900 p-8">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-yellow-500/20 p-4">
                <Award size={35} className="text-yellow-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black">Achievements</h3>
                <p className="mt-2 text-slate-400">Unlock badges by completing language goals.</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-yellow-500/20 px-4 py-2 text-yellow-300">🏆 Challenge Winner</span>
              <span className="rounded-full bg-orange-500/20 px-4 py-2 text-orange-300">🔥 30 Day Streak</span>
              <span className="rounded-full bg-purple-500/20 px-4 py-2 text-purple-300">🌍 Polyglot</span>
            </div>
          </motion.div>
        </section>

        {/* ================= DAILY MISSION ================= */}
        <section className="mt-14">
          <motion.div whileHover={{ scale: 1.02 }} className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-8">
            <h2 className="text-3xl font-black">Today's Mission</h2>
            <p className="mt-3 max-w-3xl leading-8 text-slate-300">
              Learn 10 vocabulary words, complete one listening exercise, and practice speaking for 5 minutes.
            </p>
            <button className="mt-6 rounded-xl bg-cyan-600 px-7 py-3 font-black">Start Mission</button>
          </motion.div>
        </section>

        {/* ================= FOOTER ================= */}
        <div className="mt-20 rounded-3xl border border-white/10 bg-black/30 p-8 text-center">
          <h2 className="text-3xl font-black">Challenge Yourself. Master Any Language.</h2>
          <p className="mx-auto mt-4 max-w-3xl leading-8 text-slate-400">
            Daily practice, challenges and community motivation help learners reach fluency faster.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LanguageChallenges;