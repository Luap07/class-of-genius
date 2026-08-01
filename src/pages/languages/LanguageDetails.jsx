import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Globe2,
  BookOpen,
  Volume2,
  Mic,
  Languages,
  GraduationCap,
  Brain,
  PlayCircle,
  PenTool,
  Award,
  ChevronRight,
} from "lucide-react";
import { languages } from "../../data/language/languages";
import { supabase } from "../../lib/supabaseClient";

const tabs = [
  "Overview",
  "Alphabet",
  "Grammar",
  "Vocabulary",
  "Listening",
  "Speaking",
  "Writing",
  "Culture",
  "Lessons",
  "AI Tutor",
];

const LanguageDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [lessons, setLessons] = useState([]);
const [loadingLessons, setLoadingLessons] = useState(false);

  const language = useMemo(() => {
    return (
      languages.find(
        (item) => String(item.id) === String(id)
      ) || null
    );
  }, [id]);
  useEffect(() => {
  const fetchLessons = async () => {
    if (!language?.id) return;

    try {
      setLoadingLessons(true);

      const { data, error } = await supabase
        .from("language_materials")
        .select("*")
        .eq("language_id", language.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setLessons(data || []);

    } catch (error) {
      console.error("Fetch language lessons:", error);
    } finally {
      setLoadingLessons(false);
    }
  };

  fetchLessons();

}, [language]);
  if (!language) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        Language not found.
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#020617] text-white">
      {/* HERO */}
      <div className="relative h-[520px] overflow-hidden">
        <img
          src={language.image}
          alt={language.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/30 to-transparent" />

        <div className="relative z-20 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-3 backdrop-blur-xl hover:bg-white/20 transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-black"
          >
            {language.name}
          </motion.h1>

          <p className="mt-3 text-2xl text-blue-400">{language.nativeName}</p>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            {language.description}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <span className="rounded-full bg-blue-600 px-6 py-3 font-semibold">
              {language.level}
            </span>
            <span className="rounded-full bg-slate-800 px-6 py-3">
              {language.continent}
            </span>
            <span className="rounded-full bg-slate-800 px-6 py-3">
              {language.speakers}
            </span>
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="mx-auto -mt-14 max-w-7xl px-6 relative z-30">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: <Globe2 size={34} className="text-blue-400" />, title: "Native Speakers", value: language.speakers },
            { icon: <Languages size={34} className="text-violet-400" />, title: "Difficulty", value: language.level },
            { icon: <GraduationCap size={34} className="text-green-400" />, title: "Lessons", value: "120+ Interactive Lessons" },
            { icon: <Award size={34} className="text-yellow-400" />, title: "Certificate", value: "Earn after completion" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6 }}
              className="rounded-3xl border border-white/10 bg-slate-900/90 p-7 backdrop-blur-xl"
            >
              {stat.icon}
              <h3 className="mt-5 text-lg font-bold">{stat.title}</h3>
              <p className="mt-2 text-slate-400">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div className="mx-auto mt-14 max-w-7xl px-6">
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-6 py-3 font-bold whitespace-nowrap transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW */}
      {activeTab === "Overview" && (
        <section className="mx-auto mt-12 max-w-7xl px-6">
          <div className="grid gap-8 xl:grid-cols-3">
            <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-slate-900 p-8">
              <div className="flex items-center gap-3">
                <BookOpen className="text-blue-400" />
                <h2 className="text-3xl font-black">About {language.name}</h2>
              </div>
              <p className="mt-8 leading-9 text-slate-300">
                {language.description} Learn real conversations, pronunciation, grammar, culture, writing, listening, reading, and vocabulary with interactive lessons, AI explanations, and practical exercises.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">
              <h3 className="text-2xl font-black">Quick Actions</h3>
              <div className="mt-8 space-y-4">
                {[
                  { label: "Start Course", icon: null, bg: "bg-blue-600 text-white" },
                  { label: "Lessons", icon: <PlayCircle />, bg: "bg-slate-800 text-white" },
                  { label: "AI Tutor", icon: <Brain />, bg: "bg-slate-800 text-white" },
                  { label: "Pronunciation", icon: <Volume2 />, bg: "bg-slate-800 text-white" },
                ].map((action, idx) => (
                  <button
                    key={idx}
                    className={`flex w-full items-center justify-between rounded-2xl px-5 py-4 font-bold hover:opacity-90 transition ${action.bg}`}
                  >
                    <span className="flex items-center gap-2">
                      {action.icon}
                      {action.label}
                    </span>
                    <ChevronRight />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ALPHABET */}
      {activeTab === "Alphabet" && (
        <section className="mx-auto mt-12 max-w-7xl px-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">
            <h2 className="text-3xl font-black">Alphabet</h2>
            <p className="mt-3 text-slate-400">Learn every letter with pronunciation and examples.</p>
            <div className="mt-10 grid gap-5 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-7">
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                <motion.div
                  key={letter}
                  whileHover={{ y: -8, scale: 1.05 }}
                  className="rounded-2xl border border-white/10 bg-slate-800 p-6 text-center cursor-pointer"
                >
                  <h3 className="text-5xl font-black text-blue-400">{letter}</h3>
                  <button className="mt-5 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold hover:bg-blue-500 transition">
                    Listen
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GRAMMAR */}
      {activeTab === "Grammar" && (
        <section className="mx-auto mt-12 max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              "Nouns", "Pronouns", "Verbs", "Adjectives",
              "Adverbs", "Sentence Structure", "Past Tense", "Future Tense",
            ].map((topic) => (
              <motion.div
                key={topic}
                whileHover={{ y: -6 }}
                className="rounded-3xl border border-white/10 bg-slate-900 p-8"
              >
                <BookOpen className="text-blue-400" />
                <h3 className="mt-5 text-2xl font-bold">{topic}</h3>
                <p className="mt-4 leading-8 text-slate-400">
                  Learn rules, examples, exercises and quizzes.
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* VOCABULARY */}
      {activeTab === "Vocabulary" && (
        <section className="mx-auto mt-12 max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[
              "Greetings", "Family", "Travel", "Business",
              "Food", "Shopping", "Hospital", "Airport", "Technology",
            ].map((item) => (
              <motion.div
                key={item}
                whileHover={{ scale: 1.03 }}
                className="rounded-3xl border border-white/10 bg-slate-900 p-7"
              >
                <Languages className="text-cyan-400" />
                <h3 className="mt-5 text-xl font-bold">{item}</h3>
                <p className="mt-4 text-slate-400">Master useful vocabulary, pronunciation and examples.</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* LISTENING */}
      {activeTab === "Listening" && (
        <section className="mx-auto mt-12 max-w-7xl px-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-10 text-center">
            <Volume2 size={70} className="mx-auto text-blue-400" />
            <h2 className="mt-6 text-3xl font-black">Listening Practice</h2>
            <p className="mt-5 max-w-3xl mx-auto leading-9 text-slate-400">
              Listen to native speakers, conversations, interviews, podcasts, news and stories.
            </p>
            <button className="mt-10 rounded-full bg-blue-600 px-8 py-4 font-bold hover:bg-blue-500 transition">
              Start Listening
            </button>
          </div>
        </section>
      )}

      {/* SPEAKING */}
      {activeTab === "Speaking" && (
        <section className="mx-auto mt-12 max-w-7xl px-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-10 text-center">
            <Mic size={70} className="mx-auto text-green-400" />
            <h2 className="mt-6 text-3xl font-black">Speaking Practice</h2>
            <p className="mt-5 leading-9 text-slate-400">
              Record your voice and compare it with native pronunciation.
            </p>
          </div>
        </section>
      )}

      {/* WRITING */}
      {activeTab === "Writing" && (
        <section className="mx-auto mt-12 max-w-7xl px-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-10">
            <div className="flex items-center gap-4">
              <PenTool size={42} className="text-yellow-400" />
              <div>
                <h2 className="text-3xl font-black">Writing Practice</h2>
                <p className="text-slate-400 mt-2">Practice writing words, sentences and essays.</p>
              </div>
            </div>
            <textarea
              rows={10}
              placeholder="Write something here..."
              className="mt-8 w-full rounded-3xl border border-white/10 bg-slate-800 p-6 outline-none text-white focus:border-blue-500 transition"
            />
            <button className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 font-bold hover:bg-blue-500 transition">
              Check Writing
            </button>
          </div>
        </section>
      )}

      {/* CULTURE */}
      {activeTab === "Culture" && (
        <section className="mx-auto mt-12 max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              "Food", "Traditions", "Festivals", "History",
              "Music", "Movies", "Religion", "Daily Life",
            ].map((item) => (
              <motion.div
                key={item}
                whileHover={{ y: -8 }}
                className="rounded-3xl border border-white/10 bg-slate-900 p-8"
              >
                <Globe2 className="text-cyan-400" />
                <h3 className="mt-6 text-xl font-bold">{item}</h3>
                <p className="mt-3 text-slate-400">Learn authentic cultural experiences.</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* LESSONS */}
{activeTab === "Lessons" && (
<section className="mx-auto mt-12 max-w-7xl px-6 pb-16">

<div className="space-y-5">

{loadingLessons ? (

<div className="text-center text-gray-400 py-10">
Loading lessons...
</div>

) : lessons.length === 0 ? (

<div className="rounded-3xl border border-white/10 bg-slate-900 p-10 text-center">

<h3 className="text-2xl font-black">
No lessons available yet
</h3>

<p className="mt-3 text-slate-400">
New lessons will appear here when uploaded.
</p>

</div>

) : (

lessons.map((lesson)=> (

<motion.div
key={lesson.id}
whileHover={{x:8}}
className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900 p-6"
>

<div>

<h3 className="text-xl font-bold">
{lesson.title}
</h3>


<p className="text-slate-400">
{lesson.description}
</p>


<span className="inline-block mt-3 rounded-full bg-blue-600/20 px-4 py-1 text-sm text-blue-400">
{lesson.type}
</span>


</div>


<a
href={lesson.file_url}
target="_blank"
rel="noreferrer"
className="rounded-2xl bg-blue-600 px-6 py-3 font-bold hover:bg-blue-500"
>

Open

</a>


</motion.div>

))

)}

</div>

</section>
)}
      {/* AI TUTOR */}
      {activeTab === "AI Tutor" && (
        <section className="mx-auto mt-12 max-w-7xl px-6 pb-16">
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-10 text-center">
            <Brain size={70} className="mx-auto text-violet-400" />
            <h2 className="mt-6 text-3xl font-black">AI Language Assistant</h2>
            <p className="mt-5 max-w-2xl mx-auto text-slate-400">
              Chat live, ask grammar questions, and practice scenarios directly with your personal AI mentor tailored to {language.name}.
            </p>
            <button className="mt-10 rounded-full bg-violet-600 px-8 py-4 font-bold hover:bg-violet-500 transition">
              Open AI Chat
            </button>
          </div>
        </section>
      )}
    </section>
  );
};

export default LanguageDetails;